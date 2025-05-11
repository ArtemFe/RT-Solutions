document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('elastic');
    const searchBtn = document.querySelector('.button-search');
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
            }
        });
        // По Enter тоже
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});
