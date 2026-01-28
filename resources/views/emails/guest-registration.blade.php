<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Добро пожаловать!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #222;
            font-size: 24px;
            margin: 0;
        }
        .content {
            margin-bottom: 30px;
        }
        .credentials {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .credentials-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .credentials-row:last-child {
            border-bottom: none;
        }
        .credentials-label {
            color: #666;
            font-weight: 500;
        }
        .credentials-value {
            color: #222;
            font-weight: 600;
        }
        .button {
            display: inline-block;
            background-color: #222;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .warning {
            background-color: #fff3cd;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            font-size: 13px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌸 Добро пожаловать!</h1>
        </div>

        <div class="content">
            <p>Здравствуйте, <strong>{{ $user->name }}</strong>!</p>

            <p>Благодарим вас за оформление заказа в нашем магазине. Для вас был автоматически создан личный кабинет, где вы сможете отслеживать статус заказов и историю покупок.</p>

            <div class="credentials">
                <div class="credentials-row">
                    <span class="credentials-label">Email:</span>
                    <span class="credentials-value">{{ $user->email }}</span>
                </div>
                <div class="credentials-row">
                    <span class="credentials-label">Телефон:</span>
                    <span class="credentials-value">{{ $user->phone }}</span>
                </div>
                <div class="credentials-row">
                    <span class="credentials-label">Пароль:</span>
                    <span class="credentials-value">{{ $password }}</span>
                </div>
            </div>

            <p>Вы можете войти в личный кабинет, используя email или телефон и пароль, указанные выше.</p>

            <div class="button-container">
                <a href="{{ config('app.url') }}" class="button">Перейти на сайт</a>
            </div>

            <div class="warning">
                ⚠️ Рекомендуем сменить пароль после первого входа в личный кабинет для обеспечения безопасности вашего аккаунта.
            </div>
        </div>

        <div class="footer">
            <p>Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
            <p>© {{ date('Y') }} {{ config('app.name') }}. Все права защищены.</p>
        </div>
    </div>
</body>
</html>

