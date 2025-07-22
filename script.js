document.addEventListener('DOMContentLoaded', () => {
    // Получаем доступ к элементам DOM
    const canvas = document.getElementById('roulette-canvas');
    const spinButton = document.getElementById('spin-button');
    const modal = document.getElementById('result-modal');
    const resultText = document.getElementById('result-text');
    const closeModalButton = document.getElementById('close-modal-button');

    // Инициализируем объект Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.ready(); // Сообщаем Telegram, что приложение готово к отображению

    const ctx = canvas.getContext('2d');

    // --- НАСТРОЙКИ РУЛЕТКИ ---
    // Список призов. Можно легко добавлять или удалять секторы.
    const segments = [
        { color: '#FDFD96', label: '10 🍄' },
        { color: '#FFB3B3', label: 'Ничего' },
        { color: '#C1FFD7', label: 'Скидка 5%' },
        { color: '#FFDDC1', label: '25 🍄' },
        { color: '#B3E0FF', label: 'Попробовать снова' },
        { color: '#FFB3E6', label: 'Скидка 10%' },
        { color: '#D7B3FF', label: '50 🍄' },
        { color: '#B3FFFF', label: '100 🍄' }
    ];

    const segmentCount = segments.length;
    const anglePerSegment = 2 * Math.PI / segmentCount;
    const radius = canvas.width / 2;
    let currentRotation = 0; // Текущий угол поворота колеса
    let isSpinning = false;

    // Функция для отрисовки колеса рулетки
    function drawRoulette() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(radius, radius); // Перемещаем центр координат в центр canvas

        segments.forEach((segment, i) => {
            const startAngle = i * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;

            // Рисуем сектор
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 5, startAngle, endAngle); // -5 для небольшого отступа от края
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            ctx.stroke(); // Добавляем обводку для лучшего разделения

            // Рисуем текст на секторе
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.font = 'bold 16px Montserrat';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Поворачиваем контекст, чтобы текст был направлен от центра
            const textAngle = startAngle + anglePerSegment / 2;
            ctx.rotate(textAngle);
            ctx.fillText(segment.label, radius * 0.65, 0); // 0.65 - расстояние от центра
            ctx.restore();
        });
        ctx.restore();
    }

    // Функция для запуска вращения
    function spin() {
        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true; // Деактивируем кнопку
        spinButton.textContent = 'УДАЧИ!';

        // Определяем случайный угол остановки
        const randomStopAngle = Math.random() * (2 * Math.PI);
        // Добавляем несколько полных оборотов для красивой анимации
        const fullSpins = 5 * (2 * Math.PI);
        const totalRotation = fullSpins + randomStopAngle;

        // Применяем CSS transition для плавного вращения
        canvas.style.transform = `rotate(${totalRotation}rad)`;
        currentRotation = totalRotation;

        // Ждем окончания анимации (время должно совпадать с transition в CSS)
        setTimeout(announceResult, 6200); // 6000ms анимация + 200ms запас
    }

    // Функция определения и отображения результата
    function announceResult() {
        // Вычисляем итоговый угол (остаток от деления на 2*PI)
        const finalAngle = currentRotation % (2 * Math.PI);

        // Вычисляем индекс выигрышного сектора.
        const pointerPosition = (2 * Math.PI) - finalAngle + (anglePerSegment / 2);
        const winningIndex = Math.floor(pointerPosition / anglePerSegment) % segmentCount;
        const winningSegment = segments[winningIndex];

        // Отображаем результат в модальном окне
        showModal(winningSegment.label);

        isSpinning = false;
        // Кнопку не активируем, т.к. пользователь должен закрыть приложение
    }

    // Функция для показа модального окна
    function showModal(prize) {
        if (prize === 'Ничего' || prize === 'Попробовать снова') {
             resultText.innerHTML = `В этот раз не повезло. <br>Ваш результат: <strong>${prize}</strong>`;
        } else {
             resultText.innerHTML = `Ваш выигрыш: <strong>${prize}</strong>`;
        }
        modal.classList.add('visible');
    }

    // Функция для закрытия модального окна и всего приложения
    function closeModal() {
        modal.classList.remove('visible');
        // Команда для Telegram закрыть окно Mini App
        tg.close();
    }

    // Назначаем обработчики событий
    spinButton.addEventListener('click', spin);
    closeModalButton.addEventListener('click', closeModal);

    // Первоначальная отрисовка колеса при загрузке страницы
    drawRoulette();
});
