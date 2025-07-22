document.addEventListener('DOMContentLoaded', () => {
    // Получаем доступ ко всем элементам DOM
    const canvas = document.getElementById('roulette-canvas');
    const spinButton = document.getElementById('spin-button');
    const modal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const spinAgainButton = document.getElementById('spin-again-button');
    const closeAppButton = document.getElementById('close-app-button');

    const tg = window.Telegram.WebApp;
    tg.ready();

    const ctx = canvas.getContext('2d');
    const segments = [
        { color: '#f9e79f', label: '10', icon: '🍄' },
        { color: '#d5dbdb', label: 'Нічого', icon: '🍂' },
        { color: '#a9dfbf', label: 'Знижка 5%', icon: '🏷️' },
        { color: '#f5cba7', label: '25', icon: '🍄' },
        { color: '#aed6f1', label: 'Ще раз', icon: '🔄' },
        { color: '#f1c40f', label: 'Знижка 10%', icon: '🏷️' },
        { color: '#d7bde2', label: '50', icon: '🍄' },
        { color: '#fAD7A0', label: '100', icon: '🍄' }
    ];

    const segmentCount = segments.length;
    const anglePerSegment = 2 * Math.PI / segmentCount;
    const radius = canvas.width / 2;
    let currentRotation = 0;
    let isSpinning = false;

    // Функция отрисовки осталась без изменений
    function drawRoulette() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#5E2F0E';
        ctx.lineWidth = 2;
        for (let i = radius - 20; i > 20; i -= 25) {
            ctx.beginPath();
            ctx.arc(radius, radius, i, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.save();
        ctx.translate(radius, radius);
        segments.forEach((segment, i) => {
            const startAngle = i * anglePerSegment;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 5, startAngle, startAngle + anglePerSegment);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#5E2F0E';
            ctx.stroke();
            ctx.save();
            ctx.fillStyle = '#402a1a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textAngle = startAngle + anglePerSegment / 2;
            ctx.rotate(textAngle);
            ctx.font = '24px Montserrat';
            ctx.fillText(segment.icon, radius * 0.55, 0);
            ctx.font = 'bold 14px Montserrat';
            ctx.fillText(segment.label, radius * 0.80, 0);
            ctx.restore();
        });
        ctx.restore();
    }

    // --- ИЗМЕНЕНО: Функция вращения ---
    function spin() {
        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true;
        spinButton.textContent = 'УДАЧІ!';

        // Включаем анимацию перед вращением
        canvas.style.transition = 'transform 6s cubic-bezier(0.15, 0.75, 0.3, 1)';

        const randomStopAngle = Math.random() * (2 * Math.PI);
        const fullSpins = 7 * (2 * Math.PI);
        const totalRotation = fullSpins + randomStopAngle;

        // Накапливаем общий угол поворота
        currentRotation += totalRotation;

        canvas.style.transform = `rotate(${currentRotation}rad)`;

        setTimeout(announceResult, 6200);
    }

    // --- ИЗМЕНЕНО: Функция объявления результата ---
    function announceResult() {
        const finalAngle = currentRotation % (2 * Math.PI);
        const pointerPosition = (2 * Math.PI) - finalAngle + (anglePerSegment / 2);
        const winningIndex = Math.floor(pointerPosition / anglePerSegment) % segmentCount;
        const winningSegment = segments[winningIndex];

        showModal(winningSegment);
        isSpinning = false;

        // --- ДОБАВЛЕН БЛОК СБРОСА АНИМАЦИИ ---
        // После показа результата, мы "сбрасываем" колесо в его конечное положение
        // без анимации, чтобы следующий прокрут был "чистым".
        setTimeout(() => {
            // 1. Выключаем плавный переход
            canvas.style.transition = 'none';
            // 2. Устанавливаем итоговый угол (остаток от деления на 360 градусов)
            const actualFinalRotation = currentRotation % (2 * Math.PI);
            canvas.style.transform = `rotate(${actualFinalRotation}rad)`;
            // 3. Обновляем currentRotation, чтобы он не накапливался бесконечно
            currentRotation = actualFinalRotation;
        }, 500); // Небольшая задержка после окончания анимации
    }

    // Функция показа модального окна без изменений
    function showModal(prize) {
        const isWin = !(prize.label === 'Нічого' || prize.label === 'Ще раз');
        if (isWin) {
            resultTitle.textContent = 'Вітаємо!';
            resultText.innerHTML = `Ваш виграш: <strong>${prize.label} ${prize.icon}</strong>`;
        } else {
            resultTitle.textContent = 'На жаль...';
            resultText.innerHTML = `Цього разу не пощастило. <br>Спробуйте <strong>${prize.label.toLowerCase()}</strong>!`;
        }
        modal.classList.add('visible');
    }

    // Функция для кнопки "Ще раз" без изменений
    function playAgain() {
        modal.classList.remove('visible');
        spinButton.disabled = false;
        spinButton.textContent = 'КРУТИТИ!';
    }

    // Функция для кнопки "Закрити" без изменений
    function closeApp() {
        tg.close();
    }

    // Назначение обработчиков без изменений
    spinButton.addEventListener('click', spin);
    spinAgainButton.addEventListener('click', playAgain);
    closeAppButton.addEventListener('click', closeApp);

    // Первоначальная отрисовка
    drawRoulette();
});
