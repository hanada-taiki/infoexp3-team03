
async function loadMessages() {
    const r = await fetch('/api/messages');
    const xs = await r.json();

    document.querySelector('#messages').innerHTML = xs.map(x =>
        `<article class="message">
            <b>${escapeHtml(x.name)}</b>
            <p>${escapeHtml(x.message)}</p>
            <div class="meta">#${x.id}</div>
        </article>`
    ).join('');
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// 文字数カウント
const messageInput = document.querySelector('#message');
const charCount = document.querySelector('#char-count');

function updateCharCount() {
    charCount.textContent =
        `${messageInput.value.length} / 300 文字`;
}

messageInput.addEventListener('input', updateCharCount);
updateCharCount();

// 解答の正誤判定
function checkAnswer(message) {
    const answer = message.trim().replace(/\s/g, '');

    const correctAnswers = ['東京', 'とうきょう'];

    return correctAnswers.includes(answer);
}

// 解答投稿
document.querySelector('#form').addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.querySelector('#name').value.trim();
    const message = messageInput.value.trim();

    const result = document.querySelector('#result');
    const status = document.querySelector('#status');

    if (!name || !message) {
        status.textContent = 'ニックネームと回答を入力してください。';
        return;
    }

    // まず投稿を保存
    try {
        const r = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, message })
        });

        if (!r.ok) {
            status.textContent = '投稿に失敗しました';
            return;
        }

        status.textContent = '解答を投稿しました';

        // 投稿された回答を判定
        if (checkAnswer(message)) {
            result.textContent = `${name} さん、正解！🎉`;
        } else {
            result.textContent = `${name} さん、不正解！もう一度考えてみよう。`;
        }

        // 入力欄をリセット
        messageInput.value = '';
        updateCharCount();

        // 投稿一覧を更新
        await loadMessages();

    } catch (error) {
        status.textContent = '通信に失敗しました';
    }
});

// 最初に投稿一覧を読み込む
loadMessages().catch(() => {
    document.querySelector('#messages').textContent =
        '解答一覧を読み込めませんでした。';
});
