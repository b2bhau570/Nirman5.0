#define SWITCH_1_PIN 2
#define SWITCH_2_PIN 3
#define SWITCH_3_PIN 4

#define LED_1_PIN 5
#define LED_2_PIN 6
#define LED_3_PIN 7
#define LED_4_PIN 8
#define BUZZER_PIN 9

bool led1BlinkActive = false;
unsigned long led1StartTime = 0;
const long led1BlinkDuration = 1000;

bool led4BlinkActive = false;
unsigned long led4StartTime = 0;
const long led4BlinkInterval = 500;
int led4BlinkCount = 0;
const int led4TotalBlinks = 10;
bool led4State = LOW;

bool led2BlinkActive = false;
unsigned long led2StartTime = 0;
const long led2BlinkDuration = 1000;

bool switch3Active = false;
unsigned long switch3StartTime = 0;
const long switch3WaitTime = 4000;

bool led3BlinkActive = false;
unsigned long led3StartTime = 0;
const long led3BlinkDuration = 1000;

bool buzzerActive = false;
int buzzerPhase = 0;
unsigned long buzzerPhaseStartTime = 0;
int buzzerBeepCount = 0;
const long beepInterval = 1000;
const long constantBeepDuration = 2000;

void setup() {
  pinMode(SWITCH_1_PIN, INPUT);
  pinMode(SWITCH_2_PIN, INPUT);
  pinMode(SWITCH_3_PIN, INPUT);

  pinMode(LED_1_PIN, OUTPUT);
  pinMode(LED_2_PIN, OUTPUT);
  pinMode(LED_3_PIN, OUTPUT);
  pinMode(LED_4_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_1_PIN, LOW);
  digitalWrite(LED_2_PIN, LOW);
  digitalWrite(LED_3_PIN, LOW);
  digitalWrite(LED_4_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void loop() {
  if (digitalRead(SWITCH_1_PIN) == HIGH) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);

    if (!led1BlinkActive) {
      led1BlinkActive = true;
      led1StartTime = millis();
      digitalWrite(LED_1_PIN, HIGH);
    }

    if (!led4BlinkActive) {
      led4BlinkActive = true;
      led4StartTime = millis();
      led4BlinkCount = 0;
      led4State = LOW;
    }
  }

  if (digitalRead(SWITCH_2_PIN) == HIGH) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);

    if (!led2BlinkActive) {
      led2BlinkActive = true;
      led2StartTime = millis();
      digitalWrite(LED_2_PIN, HIGH);
    }
  }

  if (digitalRead(SWITCH_3_PIN) == HIGH) {
    if (!switch3Active) {
      switch3Active = true;
      switch3StartTime = millis();
      buzzerActive = true;
      buzzerPhase = 1;
      buzzerPhaseStartTime = millis();
      buzzerBeepCount = 0;
    }
  }

  unsigned long currentTime = millis();

  if (led1BlinkActive && currentTime - led1StartTime >= led1BlinkDuration) {
    digitalWrite(LED_1_PIN, LOW);
    led1BlinkActive = false;
  }

  if (led4BlinkActive) {
    if (led4BlinkCount < led4TotalBlinks * 2) {
      if (currentTime - led4StartTime >= led4BlinkInterval) {
        led4State = !led4State;
        digitalWrite(LED_4_PIN, led4State);
        led4StartTime = currentTime;
        led4BlinkCount++;
      }
    } else {
      digitalWrite(LED_4_PIN, LOW);
      led4BlinkActive = false;
    }
  }

  if (led2BlinkActive && currentTime - led2StartTime >= led2BlinkDuration) {
    digitalWrite(LED_2_PIN, LOW);
    led2BlinkActive = false;
  }

  if (switch3Active) {
    if (currentTime - switch3StartTime >= switch3WaitTime) {
      if (!led3BlinkActive) {
        led3BlinkActive = true;
        led3StartTime = currentTime;
        digitalWrite(LED_3_PIN, HIGH);
      }
    }
  }

  if (led3BlinkActive && currentTime - led3StartTime >= led3BlinkDuration) {
    digitalWrite(LED_3_PIN, LOW);
    led3BlinkActive = false;
  }

  if (buzzerActive) {
    switch (buzzerPhase) {
      case 1:
        if (buzzerBeepCount < 4) {
          if (currentTime - buzzerPhaseStartTime >= beepInterval) {
            digitalWrite(BUZZER_PIN, LOW);
            buzzerBeepCount++;
            buzzerPhaseStartTime = currentTime;
          } else if (currentTime - buzzerPhaseStartTime >= beepInterval / 2) {
            digitalWrite(BUZZER_PIN, HIGH);
          }
        } else {
          buzzerPhase = 2;
          digitalWrite(BUZZER_PIN, LOW);
          buzzerPhaseStartTime = currentTime;
        }
        break;

      case 2:
        if (currentTime - buzzerPhaseStartTime < constantBeepDuration) {
          digitalWrite(BUZZER_PIN, HIGH);
        } else {
          digitalWrite(BUZZER_PIN, LOW);
          buzzerActive = false;
        }
        break;
    }
  }

  if (!buzzerActive && !led3BlinkActive) {
    switch3Active = false;
  }
}