function showGlobalMessage(text, type = 'success') {
    const msg = document.getElementById('globalMessage');
    msg.textContent = text;
    msg.className = 'global-message' + (type === 'error' ? ' error' : '');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
} 