// ===== Инженерный калькулятор - Премиум версия =====
class EngineeringCalculator {
    constructor() {
        this.expression = '';
        this.currentInput = '0';
        this.lastResult = null;
        this.waitingForOperand = false;
        this.openParens = 0;
        this.mode = 'DEG'; // DEG или RAD
        this.history = [];
        
        this.initElements();
        this.initEventListeners();
        this.loadTheme();
        this.updateDisplay();
    }
    
    initElements() {
        this.expressionEl = document.getElementById('expression');
        this.resultEl = document.getElementById('result');
        this.modeEl = document.getElementById('mode');
        this.themeBtns = document.querySelectorAll('.theme-btn');
        this.allBtns = document.querySelectorAll('.btn');
    }
    
    initEventListeners() {
        // Делегирование событий для кнопок
        document.querySelector('.buttons-grid').addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            
            const action = btn.dataset.action;
            const value = btn.dataset.value;
            
            this.handleAction(action, value);
            this.addRippleEffect(e, btn);
        });
        
        // Поддержка клавиатуры
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Кнопки темы
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.setTheme(theme);
            });
        });
    }
    
    handleAction(action, value) {
        switch(action) {
            case 'digit':
                this.inputDigit(value);
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'clear':
                this.clearAll();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'negate':
                this.negate();
                break;
            case 'percent':
                this.percent();
                break;
            case 'parenOpen':
                this.inputParenthesis('(');
                break;
            case 'parenClose':
                this.inputParenthesis(')');
                break;
            case 'sin':
                this.calculateTrig('sin');
                break;
            case 'cos':
                this.calculateTrig('cos');
                break;
            case 'tan':
                this.calculateTrig('tan');
                break;
            case 'ln':
                this.calculateLog('ln');
                break;
            case 'log':
                this.calculateLog('log');
                break;
            case 'sqrt':
                this.calculateSqrt();
                break;
            case 'pow':
                this.inputOperator('^');
                break;
            case 'square':
                this.calculatePower(2);
                break;
            case 'pi':
                this.inputConstant(Math.PI);
                break;
            case 'e':
                this.inputConstant(Math.E);
                break;
            case 'fact':
                this.calculateFactorial();
                break;
            case 'abs':
                this.calculateAbs();
                break;
            case 'mode':
                this.toggleMode();
                break;
            case 'exp':
                this.inputOperator('E');
                break;
            case 'cube':
                this.calculatePower(3);
                break;
        }
        
        this.updateDisplay();
    }
    
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentInput = digit;
            this.waitingForOperand = false;
        } else {
            if (this.currentInput === '0' && digit !== '0') {
                this.currentInput = digit;
            } else if (this.currentInput === '0' && digit === '0') {
                return;
            } else {
                this.currentInput += digit;
            }
        }
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
            return;
        }
        
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
    }
    
    inputOperator(operator) {
        const lastChar = this.expression.slice(-1);
        
        if (this.waitingForOperand && lastChar !== ')') {
            this.expression = this.expression.slice(0, -1) + operator;
        } else {
            if (this.currentInput !== '0' || lastChar === ')') {
                this.expression += this.currentInput;
            }
            this.expression += operator;
            this.waitingForOperand = true;
            this.currentInput = '0';
        }
    }
    
    inputParenthesis(paren) {
        if (paren === '(') {
            if (!this.waitingForOperand && this.currentInput !== '0') {
                this.expression += this.currentInput + '*(';
            } else {
                this.expression += '(';
            }
            this.openParens++;
            this.waitingForOperand = true;
            this.currentInput = '0';
        } else if (paren === ')' && this.openParens > 0) {
            this.expression += this.currentInput + ')';
            this.openParens--;
            this.waitingForOperand = false;
            this.currentInput = '0';
        }
    }
    
    inputConstant(value) {
        if (this.waitingForOperand) {
            this.expression += value;
            this.waitingForOperand = false;
        } else {
            if (this.currentInput !== '0') {
                this.expression += this.currentInput + '*' + value;
            } else {
                this.expression += value;
            }
            this.currentInput = value.toString();
        }
    }
    
    calculateTrig(func) {
        let value = parseFloat(this.currentInput);
        if (this.mode === 'DEG') {
            value = value * Math.PI / 180;
        }
        
        let result;
        switch(func) {
            case 'sin': result = Math.sin(value); break;
            case 'cos': result = Math.cos(value); break;
            case 'tan': result = Math.tan(value); break;
        }
        
        this.currentInput = this.formatNumber(result);
        this.waitingForOperand = true;
    }
    
    calculateLog(func) {
        const value = parseFloat(this.currentInput);
        let result;
        
        if (func === 'ln') {
            result = Math.log(value);
        } else {
            result = Math.log10(value);
        }
        
        this.currentInput = this.formatNumber(result);
        this.waitingForOperand = true;
    }
    
    calculateSqrt() {
        const value = parseFloat(this.currentInput);
        this.currentInput = this.formatNumber(Math.sqrt(value));
        this.waitingForOperand = true;
    }
    
    calculatePower(power) {
        const value = parseFloat(this.currentInput);
        this.currentInput = this.formatNumber(Math.pow(value, power));
        this.waitingForOperand = true;
    }
    
    calculateFactorial() {
        const num = parseInt(this.currentInput);
        if (num < 0) {
            this.currentInput = 'Error';
            return;
        }
        
        let result = 1;
        for (let i = 2; i <= num; i++) {
            result *= i;
        }
        
        this.currentInput = this.formatNumber(result);
        this.waitingForOperand = true;
    }
    
    calculateAbs() {
        this.currentInput = this.formatNumber(Math.abs(parseFloat(this.currentInput)));
        this.waitingForOperand = true;
    }
    
    negate() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.startsWith('-') 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
        }
    }
    
    percent() {
        const value = parseFloat(this.currentInput) / 100;
        this.currentInput = this.formatNumber(value);
    }
    
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
    }
    
    clearAll() {
        this.expression = '';
        this.currentInput = '0';
        this.waitingForOperand = false;
        this.openParens = 0;
    }
    
    toggleMode() {
        this.mode = this.mode === 'DEG' ? 'RAD' : 'DEG';
        this.modeEl.textContent = this.mode;
    }
    
    calculate() {
        try {
            let fullExpression = this.expression + this.currentInput;
            
            // Закрываем незакрытые скобки
            while (this.openParens > 0) {
                fullExpression += ')';
                this.openParens--;
            }
            
            // Заменяем операторы
            fullExpression = fullExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\^/g, '**');
            
            // Вычисляем
            const result = eval(fullExpression);
            
            if (!isFinite(result)) {
                throw new Error('Division by zero');
            }
            
            this.expression = '';
            this.currentInput = this.formatNumber(result);
            this.lastResult = result;
            this.waitingForOperand = true;
            
        } catch (error) {
            this.currentInput = 'Error';
            this.waitingForOperand = true;
        }
    }
    
    formatNumber(num) {
        if (typeof num !== 'number' || !isFinite(num)) {
            return 'Error';
        }
        
        // Избегаем научной нотации для больших чисел
        if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
            return num.toExponential(8);
        }
        
        // Округляем до 10 знаков после запятой
        let formatted = parseFloat(num.toPrecision(12));
        
        // Убираем лишние нули
        if (Number.isInteger(formatted)) {
            return formatted.toString();
        }
        
        return formatted.toString();
    }
    
    updateDisplay() {
        this.expressionEl.textContent = this.expression || '';
        this.resultEl.textContent = this.currentInput || '0';
        
        // Анимация изменения результата
        this.resultEl.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.resultEl.style.transform = 'scale(1)';
        }, 100);
    }
    
    addRippleEffect(e, btn) {
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') {
            this.inputDigit(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            e.preventDefault();
            this.inputOperator(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape') {
            this.clearAll();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '(') {
            this.inputParenthesis('(');
        } else if (key === ')') {
            this.inputParenthesis(')