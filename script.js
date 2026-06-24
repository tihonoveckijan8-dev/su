// ===== Состояние калькулятора =====
const state = {
    expression: '',
    result: '0',
    isResultShown: false,
    mode: 'deg', // 'deg' или 'rad'
    lastOperator: null,
    memory: null
};

// ===== DOM элементы =====
const displayExpression = document.getElementById('expression');
const displayResult = document.getElementById('result');
const modeDisplay = document.getElementById('modeDisplay');

// ===== Функции =====
function updateDisplay() {
    displayExpression.textContent = state.expression || '';
    displayResult.textContent = state.result || '0';
}

function appendToExpression(value) {
    if (state.isResultShown) {
        // Если показан результат, начинаем новое выражение
        state.expression = '';
        state.isResultShown = false;
    }
    state.expression += value;
    state.result = state.expression;
    updateDisplay();
}

function evaluateExpression() {
    try {
        // Подготовка выражения для вычисления
        let expr = state.expression
            .replace(/π/g, `(${Math.PI})`)
            .replace(/e/g, `(${Math.E})`)
            .replace(/sin\(/g, `Math.sin(${state.mode === 'deg' ? '' : ''}`)
            .replace(/cos\(/g, `Math.cos(${state.mode === 'deg' ? '' : ''}`)
            .replace(/tan\(/g, `Math.tan(${state.mode === 'deg' ? '' : ''}`)
            .replace(/ln\(/g, `Math.log(`)
            .replace(/log\(/g, `Math.log10(`)
            .replace(/√\(/g, `Math.sqrt(`)
            .replace(/fact\(/g, `factorial(`)
            .replace(/abs\(/g, `Math.abs(`)
            .replace(/x²/g, `**2`)
            .replace(/xʸ/g, `**`)
            .replace(/×/g, `*`)
            .replace(/÷/g, `/`)
            .replace(/−/g, `-`);

        // Обработка процентов
        expr = expr.replace(/%/g, `/100`);

        // Дополнительная обработка для тригонометрических функций в градусах
        if (state.mode === 'deg') {
            expr = expr.replace(/Math\.sin\(/g, `Math.sin(${Math.PI}/180*`);
            expr = expr.replace(/Math\.cos\(/g, `Math.cos(${Math.PI}/180*`);
            expr = expr.replace(/Math\.tan\(/g, `Math.tan(${Math.PI}/180*`);
        }

        // Функция факториала
        window.factorial = function(n) {
            if (n < 0) return Infinity;
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        };

        // Вычисление
        const result = Function('"use strict"; return (' + expr + ')')();
        state.result = String(Number.isFinite(result) ? result : 'Ошибка');
        state.isResultShown = true;
        state.expression = state.expression + ' =';
        updateDisplay();
    } catch (error) {
        state.result = 'Ошибка';
        updateDisplay();
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
                // Проверка, есть ли уже точка в последнем числе
                const lastNumber = state.expression.split(/[\+\-\*\/\(\)]/).pop();
                if (!lastNumber.includes('.')) {
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
                evaluateExpression();
                break;

            case 'clear':
                state.expression = '';
                state.result = '0';
                state.isResultShown = false;
                updateDisplay();
                break;

            case 'backspace':
                if (!state.isResultShown) {
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
                    // Инвертирование знака последнего числа
                    const match = state.expression.match(/([\+\-\*\/]?)([0-9.]+)$/);
                    if (match) {
                        const [_, operator, number] = match;
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
                break;

            case 'pi':
                appendToExpression('π');
                break;

            case 'e':
                appendToExpression('e');
                break;

            case 'sin':
            case 'cos':
            case 'tan':
            case 'ln':
            case 'log':
            case 'sqrt':
            case 'fact':
            case 'abs':
                appendToExpression(action + '(');
                break;

            case 'pow':
                appendToExpression('xʸ');
                break;

            case 'square':
                appendToExpression('x²');
                break;

            case 'percent':
                appendToExpression('%');
                break;

            case 'parenOpen':
                appendToExpression('(');
                break;

            case 'parenClose':
                appendToExpression(')');
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
        
        // Обновляем иконку для светлой темы
        if (theme === 'light') {
            this.textContent = '◉';
        } else if (theme === 'dark') {
            this.textContent = '◉';
        } else if (theme === 'ocean') {
            this.textContent = '◉';
        }
    });
});

// ===== Клавиатура =====
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
