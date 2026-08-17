export default class ProgressReporter {
  onTestBegin(test) {
    console.log(`[e2e] BEGIN ${test.location.file}:${test.location.line} ${test.title}`);
  }

  onTestEnd(test, result) {
    console.log(`[e2e] END ${test.location.file}:${test.location.line} ${test.title} status=${result.status} durationMs=${result.duration}`);
  }
}
