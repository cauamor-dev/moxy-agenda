document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Formulário de login não encontrado');
        return;
    }
    
    // Verificar se já está logado
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        window.location.replace('agenda.html');
        return;
    }

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Entrando...';

            console.log('Tentando fazer login...');
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Resposta recebida:', response.status);
            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (response.ok && data.token) {
                console.log('Login bem sucedido, salvando token...');
                // Salvar token
                if (remember) {
                    localStorage.setItem('token', data.token);
                } else {
                    sessionStorage.setItem('token', data.token);
                }
                
                console.log('Token salvo, redirecionando...');
                // Redirecionar para a agenda
                window.location.replace('agenda.html');
            } else {
                console.error('Erro no login:', data.message);
                alert(data.message || 'Erro ao fazer login');
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar com o servidor. Verifique se o servidor está rodando.');
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
}); 