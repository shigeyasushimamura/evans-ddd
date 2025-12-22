export interface TaskComponent {
  getName(): string;
  getEstimatedHours(): number;
  isCompleted(): boolean;
  complete(): void;
}

export class SimpleTask implements TaskComponent {
  private completed: boolean = false;

  constructor(private name: string, private hours: number) {}

  getName(): string {
    return this.name;
  }
  getEstimatedHours(): number {
    return this.hours;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  complete(): void {
    this.completed = true;
    console.log(`Task [${this.name}] is now completed.`);
  }
}

export class TaskGroup implements TaskComponent {
  private children: TaskComponent[] = [];
  constructor(private name: string) {}

  add(task: TaskComponent): void {
    this.children.push(task);
  }

  getName(): string {
    return this.name;
  }
  getEstimatedHours(): number {
    return this.children.reduce(
      (total, task) => total + task.getEstimatedHours(),
      0
    );
  }

  isCompleted(): boolean {
    return this.children.every((task) => task.isCompleted());
  }

  complete(): void {
    this.children.forEach((task) => task.complete());
  }
}

// main.ts
const task1 = new SimpleTask("要件定義", 10);
const task2 = new SimpleTask("基本設計", 20);

const subProject = new TaskGroup("開発フェーズ");
subProject.add(new SimpleTask("コーディング", 40));
subProject.add(new SimpleTask("単体テスト", 15));

const mainProject = new TaskGroup("全社基幹システム刷新プロジェクト");
mainProject.add(task1);
mainProject.add(task2);
mainProject.add(subProject); // Compositeの中にCompositeを入れる

// クライアントは単一の TaskComponent として扱う
function printTaskInfo(task: TaskComponent) {
  console.log(`名前: ${task.getName()}`);
  console.log(`総見積もり時間: ${task.getEstimatedHours()}h`);
  console.log(`完了ステータス: ${task.isCompleted() ? "完了" : "未完了"}`);
}

printTaskInfo(mainProject);
mainProject.complete();

export {};

// オールドチョコファッション
// ゴールデンチョコレート
