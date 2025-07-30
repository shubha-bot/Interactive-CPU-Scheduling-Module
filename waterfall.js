let animationSpeed = 1500;
let animationInProgress = false;

function startAnimation(mode) {
    if (animationInProgress) return;

    animationSpeed = mode === 'fast' ? 500 : 1500;
    resetWaterfall();
    animationInProgress = true;

    const steps = ['requirements', 'design', 'implementation', 'testing', 'deployment', 'maintenance'];
    let index = 0;

    function advanceStep() {
        if (index > 0) {
            const prevStep = document.getElementById(steps[index - 1]);
            prevStep.classList.remove('active');
            prevStep.classList.add('completed');
        }

        if (index < steps.length) {
            const currentStep = document.getElementById(steps[index]);
            currentStep.classList.add('active');
            index++;
            setTimeout(advanceStep, animationSpeed);
        } else {
            animationInProgress = false;
            alert("Waterfall model visualization completed!");
        }
    }

    advanceStep();
}

function resetWaterfall() {
    const steps = ['requirements', 'design', 'implementation', 'testing', 'deployment', 'maintenance'];
    steps.forEach(stepId => {
        const step = document.getElementById(stepId);
        step.classList.remove('active', 'completed');
    });
}
