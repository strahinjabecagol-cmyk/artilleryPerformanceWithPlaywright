let testNameEmitted = false;

function emitTestNameOnce(events, vuContext) {
    if (testNameEmitted) return;

    try {
        const testName =
            vuContext?.scenario?.custom?.testName ||
            vuContext?.config?.name ||
            'Unnamed_Test';

        // Sanitize the name for safe metric key
        const safeName = testName.replace(/[^a-zA-Z0-9-_]/g, '_');

        events.emit('counter', `TEST_NAME.${safeName}`, 1);
        console.log(`✅ Emitted test name once: ${testName}`);

        testNameEmitted = true;
    } catch (err) {
        console.error('❌ Failed to emit test name:', err);
    }
}


module.exports = { emitTestNameOnce };
