#include <Servo.h>

#define MAX_SIGNAL 2000    // 最大信号値
#define MIN_SIGNAL 1000    // 最小信号値
#define CENTER_SIGNAL 1500 // 中心信号値
#define ARM_SIGNAL 500     // アーミング信号値（多くのESCで完全停止に使用）
#define SIGNAL_RANGE 450   // 信号範囲（中心から各方向）

#define ESC_PIN_L 9        // 左モーター用ESCの信号ピン
#define ESC_PIN_R 6       // 右モーター用ESCの信号ピン

Servo escL, escR;  // 左右のESCを制御するServoオブジェクト

char currentCommand = 's';
int speedLevel = 40;  // 10 to 70の範囲で速度を制御 (10, 20, 30, 40, 50, 60, 70 のいずれか)

void setup() {
  Serial.begin(115200);
  
  escL.attach(ESC_PIN_L);
  escR.attach(ESC_PIN_R);

  Serial.println("ESC Calibration...");
  calibrateESC(escL);
  calibrateESC(escR);
  
  Serial.println("ESC Calibration complete. Ready for input.");
  Serial.println("Enter 1 (right), 2 (backward), 3 (forward), 4 (left), s (stop), or + / - for speed control");
}

void loop() {
  if (Serial.available() > 0) {
    char input = Serial.read();
    processInput(input);
  }
  
  executeCommand(currentCommand);
  
  delay(50);
}

void processInput(char input) {
  switch(input) {
    case '1': case '2': case '3': case '4': case 's': case 'S':
      currentCommand = input;
      Serial.print("New command: ");
      Serial.println(currentCommand);
      break;
    case '+':
      speedLevel = min(speedLevel + 10, 70);
      Serial.print("Speed level: ");
      Serial.println(speedLevel);
      break;
    case '-':
      speedLevel = max(speedLevel - 10, 10);
      Serial.print("Speed level: ");
      Serial.println(speedLevel);
      break;
  }
}

void executeCommand(char command) {
  switch(command) {
    case '1': rightRotation(); break;
    case '2': backward(); break;
    case '3': forward(); break;
    case '4': leftRotation(); break;
    case 's': case 'S': stopMotors(); break;
  }
}

void calibrateESC(Servo &esc) {
  esc.writeMicroseconds(MAX_SIGNAL);
  delay(2000);
  esc.writeMicroseconds(MIN_SIGNAL);
  delay(2000);
  esc.writeMicroseconds(CENTER_SIGNAL);
  delay(2000);
}

int calculateSignal(int speed) {
  return CENTER_SIGNAL + (speed * SIGNAL_RANGE / 100);
}

void rightRotation() {
  escL.writeMicroseconds(calculateSignal(speedLevel));
  escR.writeMicroseconds(calculateSignal(-speedLevel));
}

void backward() {
  escL.writeMicroseconds(calculateSignal(-speedLevel));
  escR.writeMicroseconds(calculateSignal(-speedLevel));
}

void forward() {
  escL.writeMicroseconds(calculateSignal(speedLevel));
  escR.writeMicroseconds(calculateSignal(speedLevel));
}

void leftRotation() {
  escL.writeMicroseconds(calculateSignal(-speedLevel));
  escR.writeMicroseconds(calculateSignal(speedLevel));
}

void stopMotors() {
  escL.writeMicroseconds(ARM_SIGNAL);
  escR.writeMicroseconds(ARM_SIGNAL);
}
