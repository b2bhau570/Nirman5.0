#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "esp_camera.h"
#include <UniversalTelegramBot.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

const char* ssid = "silicon";
const char* password = "silicon@123";

const char* BOT_TOKEN = "8164035767:AAEhHbNs2mnkKulf34ELhHa9z_mZUuXWAi8";
const String USER_CHAT_ID = "6267027710";

#define DEFENCE_BUTTON_PIN 2
#define PANIC_BUTTON_PIN 12
#define SAFE_BUTTON_PIN 13
#define FLASHLIGHT_PIN 4

#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

HardwareSerial& GPSSerial = Serial;
TinyGPSPlus gps;

String name = "Satyabrata Pradhan";
String mobile = "999999999";

bool trackingActive = false;
unsigned long lastTrackTime = 0;
unsigned long lastButtonPress = 0;
const long debounceDelay = 200;

WiFiClientSecure client;
UniversalTelegramBot bot(BOT_TOKEN, client);
const unsigned long BOT_MTBS = 1000;
unsigned long bot_lasttime;
int bot_lastUpdateID = 0;

void setupCamera();
void setupGPIO();
void handleNewMessages(int numNewMessages);
String sendPhotoToTelegram(const String &chatID);
void sendPanicAlert();
void sendDefenceAlert();
void sendSafeAlert();
String getGoogleMapsLink();
void sendLocationMessage();

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);
  GPSSerial.begin(9600, SERIAL_8N1, 3, 1);

  WiFi.mode(WIFI_STA);
  client.setCACert(TELEGRAM_CERTIFICATE_ROOT);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  setupGPIO();
  setupCamera();
  bot.sendMessage(USER_CHAT_ID, "Device online (Aurix - partial). Use /start to see commands.");
}

void loop() {
  if (millis() - bot_lasttime > BOT_MTBS) {
    int numNewMessages = bot.getUpdates(bot_lastUpdateID + 1);
    while (numNewMessages) {
      handleNewMessages(numNewMessages);
      numNewMessages = bot.getUpdates(bot_lastUpdateID + 1);
    }
    bot_lasttime = millis();
  }

  if (millis() - lastButtonPress > debounceDelay) {
    if (digitalRead(PANIC_BUTTON_PIN) == LOW) {
      lastButtonPress = millis();
      Serial.println("Panic pressed");
      sendPanicAlert();
      delay(100);
      sendLocationMessage();
    }
    if (digitalRead(DEFENCE_BUTTON_PIN) == LOW) {
      lastButtonPress = millis();
      Serial.println("Defence pressed");
      sendDefenceAlert();
      delay(100);
      sendLocationMessage();
    }
    if (digitalRead(SAFE_BUTTON_PIN) == LOW) {
      lastButtonPress = millis();
      Serial.println("Safe pressed");
      sendSafeAlert();
      delay(100);
      sendLocationMessage();
    }
  }

  while (GPSSerial.available()) {
    gps.encode(GPSSerial.read());
  }
}

void setupGPIO() {
  pinMode(FLASHLIGHT_PIN, OUTPUT);
  pinMode(PANIC_BUTTON_PIN, INPUT_PULLUP);
  pinMode(DEFENCE_BUTTON_PIN, INPUT_PULLUP);
  pinMode(SAFE_BUTTON_PIN, INPUT_PULLUP);
  digitalWrite(FLASHLIGHT_PIN, LOW);
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 14;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed 0x%x\n", err);
  }
}

void handleNewMessages(int numNewMessages) {
  for (int i = 0; i < numNewMessages; i++) {
    bot_lastUpdateID = bot.messages[i].update_id;
    String chatID = String(bot.messages[i].chat_id);
    String text = bot.messages[i].text;
    Serial.printf("Msg from %s : %s\n", chatID.c_str(), text.c_str());

    if (chatID != USER_CHAT_ID) continue;

    if (text == "/start") {
      String welcome = "Aurix (partial):\n/show - user info\n/photo - capture photo\n/location - send location\n/track - start simple tracking\n/stop - stop tracking";
      bot.sendMessage(chatID, welcome);
    } else if (text == "/show") {
      String details = "Name: " + name + "\nMobile: " + mobile;
      bot.sendMessage(chatID, details);
    } else if (text == "/photo") {
      bot.sendMessage(chatID, "Capturing photo...");
      sendPhotoToTelegram(chatID);
    } else if (text == "/location") {
      sendLocationMessage();
    } else if (text == "/track") {
      trackingActive = true;
      lastTrackTime = millis();
      bot.sendMessage(chatID, "Tracking enabled (manual). Use /stop to disable.");
    } else if (text == "/stop") {
      trackingActive = false;
      bot.sendMessage(chatID, "Tracking stopped.");
    }
  }
}

void sendPanicAlert() {
  String message = "🚨 PANIC!\nUser: " + name + "\nMobile: " + mobile;
  bot.sendMessage(USER_CHAT_ID, message);
}

void sendDefenceAlert() {
  String message = "⚠️ Defence mode activated\nUser: " + name;
  bot.sendMessage(USER_CHAT_ID, message);
  sendPhotoToTelegram(USER_CHAT_ID);
}

void sendSafeAlert() {
  String message = "✅ User reports SAFE\nUser: " + name;
  bot.sendMessage(USER_CHAT_ID, message);
  sendPhotoToTelegram(USER_CHAT_ID);
}

void sendLocationMessage() {
  String link = getGoogleMapsLink();
  if (link != "GPS_Error") {
    bot.sendMessage(USER_CHAT_ID, "Location: " + link);
  } else {
    bot.sendMessage(USER_CHAT_ID, "GPS unavailable.");
  }
}

String sendPhotoToTelegram(const String &chatID) {
  const char* myDomain = "api.telegram.org";
  camera_fb_t *fb = NULL;
  digitalWrite(FLASHLIGHT_PIN, HIGH);
  delay(300);
  fb = esp_camera_fb_get();
  digitalWrite(FLASHLIGHT_PIN, LOW);

  if (!fb) {
    Serial.println("Camera failed");
    return "CAM_ERR";
  }

  String result = "";
  if (client.connect(myDomain, 443)) {
    String head = "--B\r\nContent-Disposition: form-data; name=\"chat_id\"\r\n\r\n" + chatID + "\r\n--B\r\nContent-Disposition: form-data; name=\"photo\"; filename=\"img.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--B--\r\n";
    size_t total = fb->len + head.length() + tail.length();
    client.println("POST /bot" + String(BOT_TOKEN) + "/sendPhoto HTTP/1.1");
    client.println("Host: " + String(myDomain));
    client.println("Content-Type: multipart/form-data; boundary=B");
    client.println("Content-Length: " + String(total));
    client.println();
    client.print(head);
    size_t sent = 0;
    while (sent < fb->len) {
      size_t chunk = (fb->len - sent > 1024) ? 1024 : (fb->len - sent);
      client.write(fb->buf + sent, chunk);
      sent += chunk;
    }
    client.print(tail);
    unsigned long start = millis();
    while (millis() - start < 2000 && client.available()) {
      result += (char)client.read();
    }
    client.stop();
  }

  esp_camera_fb_return(fb);
  return result;
}

String getGoogleMapsLink() {
  unsigned long start = millis();
  while (millis() - start < 3000) {
    while (GPSSerial.available()) gps.encode(GPSSerial.read());
    if (gps.location.isValid()) {
      double lat = gps.location.lat();
      double lon = gps.location.lng();
      return "http://maps.google.com/maps?q=" + String(lat, 6) + "," + String(lon, 6);
    }
  }
  return "GPS_Error";
}
