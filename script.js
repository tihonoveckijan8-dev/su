// ===== Состояние калькулятора =====
const state = {
    expression: '',
    result: '0',
    isResultShown: false,
    mode: 'deg'
};

// ===== DOM элементы =====
const displayExpression = document.getElementById('expression');
const displayResult = document.getElementById('result');
const modeDisplay = document.getElementById('modeDisplay');

// ===== Обновление дисплея =====
function updateDisplay() {
    displayExpression.textContent = state.expression || '';
    displayResult.textContent = state.result || '0';
}

// ===== Функция факториала =====
function factorial(n) {
    if (n < 0) return Infinity;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// ===== Вычисление выражения =====
function calculate(expr) {
    try {
        // Заменяем символы на JavaScript операторы
        let processed = expr
            .replace(/π/g, Math.PI)
            .replace(/e(?![xp])/g, Math.E)
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/x²/g, '**2')
            .replace(/xʸ/g, '**')
            .replace(/%/g, '/100');

        // Обработка функций
        // Сначала обрабатываем тригонометрические функции
        if (state.mode === 'deg') {
            processed = processed.replace(/sin\(/g, 'Math.sin(DEG2RAD(');
            processed = processed.replace(/cos\(/g, 'Math.cos(DEG2RAD(');
            processed = processed.replace(/tan\(/g, 'Math.tan(DEG2RAD(');
        } else {
            processed = processed.replace(/sin\(/g, 'Math.sin(');
            processed = processed.replace(/cos\(/g, 'Math.cos(');
            processed = processed.replace(/tan\(/g, 'Math.tan(');
        }

        processed = processed
            .replace(/ln\(/g, 'Math.log(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/fact\(/g, 'factorial(');

        // Добавляем функцию преобразования градусов в радианы
        const DEG2RAD = (x) => x * Math.PI / 180;

        // Вычисляем
        const result = Function('DEG2RAD', 'factorial', `return (${processed})`)(DEG2RAD, factorial);
        
        if (!isFinite(result)) return 'Ошибка';
        if (Number.isInteger(result)) return String(result);
        return String(parseFloat(result.toFixed(10)));
    } catch (error) {
        return 'Ошибка';
    }
}

// ===== Обработчики кнопок =====
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const action = this.dataset.action;
        const value = this.dataset.value;

        switch (action) {
            case 'digit':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += value;
                state.result = state.expression;
                updateDisplay();
                break;

            case 'decimal':
                if (state.isResultShown) {
                    state.expression = '0';
                    state.isResultShown = false;
                }
                // Проверяем, есть ли уже точка в последнем числе
                const parts = state.expression.split(/[\+\-\*\/\(\)]/);
                const lastPart = parts[parts.length - 1];
                if (!lastPart.includes('.')) {
                    state.expression += '.';
                    state.result = state.expression;
                    updateDisplay();
                }
                break;

            case 'operator':
                if (state.isResultShown) {
                    state.expression = state.result + value;
                    state.isResultShown = false;
                } else {
                    state.expression += value;
                }
                state.result = state.expression;
                updateDisplay();
                break;

            case 'equals':
                if (state.expression) {
                    const result = calculate(state.expression);
                    state.expression = state.expression + ' =';
                    state.result = result;
                    state.isResultShown = true;
                    updateDisplay();
                }
                break;

            case 'clear':
                state.expression = '';
                state.result = '0';
                state.isResultShown = false;
                updateDisplay();
                break;

            case 'backspace':
                if (!state.isResultShown && state.expression.length > 0) {
                    state.expression = state.expression.slice(0, -1);
                    state.result = state.expression || '0';
                    updateDisplay();
                }
                break;

            case 'negate':
                if (state.isResultShown) {
                    state.expression = String(-parseFloat(state.result));
                    state.result = state.expression;
                    state.isResultShown = false;
                } else if (state.expression) {
                    // Инвертируем последнее число
                    const match = state.expression.match(/([\+\-\*\/\(]?)([0-9.]+)$/);
                    if (match) {
                        const prefix = match[1] || '';
                        const number = match[2];
                        const newNumber = String(-parseFloat(number));
                        state.expression = state.expression.slice(0, -number.length) + newNumber;
                        state.result = state.expression;
                        updateDisplay();
                    }
                }
                break;

            case 'mode':
                state.mode = state.mode === 'deg' ? 'rad' : 'deg';
                modeDisplay.textContent = state.mode.toUpperCase();
                // Меняем текст кнопки
                this.textContent = state.mode.toUpperCase();
                break;

            case 'pi':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += 'π';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'e':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += 'e';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'sin':
            case 'cos':
            case 'tan':
            case 'ln':
            case 'log':
            case 'sqrt':
            case 'fact':
            case 'abs':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += action + '(';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'pow':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += 'xʸ';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'square':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += 'x²';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'percent':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += '%';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'parenOpen':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += '(';
                state.result = state.expression;
                updateDisplay();
                break;

            case 'parenClose':
                if (state.isResultShown) {
                    state.expression = '';
                    state.isResultShown = false;
                }
                state.expression += ')';
                state.result = state.expression;
                updateDisplay();
                break;

            default:
                break;
        }
    });
});

// ===== Переключение тем =====
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const theme = this.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
    });
});

// ===== Поддержка клавиатуры =====
document.addEventListener('keydown', function(e) {
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        document.querySelector(`[data-action="digit"][data-value="${key}"]`)?.click();
    } else if (key === '.') {
        document.querySelector('[data-action="decimal"]')?.click();
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        document.querySelector('[data-action="equals"]')?.click();
    } else if (key === 'Backspace') {
        e.preventDefault();
        document.querySelector('[data-action="backspace"]')?.click();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        document.querySelector('[data-action="clear"]')?.click();
    } else if (key === '+') {
        document.querySelector('[data-action="operator"][data-value="+"]')?.click();
    } else if (key === '-') {
        document.querySelector('[data-action="operator"][data-value="-"]')?.click();
    } else if (key === '*') {
        document.querySelector('[data-action="operator"][data-value="*"]')?.click();
    } else if (key === '/') {
        document.querySelector('[data-action="operator"][data-value="/"]')?.click();
    } else if (key === '(') {
        document.querySelector('[data-action="parenOpen"]')?.click();
    } else if (key === ')') {
        document.querySelector('[data-action="parenClose"]')?.click();
    } else if (key === '%') {
        document.querySelector('[data-action="percent"]')?.click();
    }
});

// ===== Инициализация =====
updateDisplay();
modeDisplay.textContent = 'DEG';

// Фикс для кнопки RAD
document.querySelector('[data-action="mode"]').textContent = 'RAD';

console.log('Калькулятор загружен!');
