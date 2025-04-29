document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) {
        console.error('Formulário de registro não encontrado');
        return;
    }
    
    // Verificar se já está logado
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        window.location.replace('agenda.html');
        return;
    }

    // Registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = registerForm.querySelector('button[type="submit"]');

        // Validações
        if (username.length < 3) {
            alert('O nome de usuário deve ter pelo menos 3 caracteres');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Registrando...';

            console.log('Tentando registrar usuário...');
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            console.log('Resposta recebida:', response.status);
            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (response.ok && data.token) {
                console.log('Registro bem sucedido');
                alert('Registro realizado com sucesso!');
                window.location.replace('index.html');
            } else {
                console.error('Erro no registro:', data.message);
                alert(data.message || 'Erro ao registrar usuário');
                submitButton.disabled = false;
                submitButton.textContent = 'Criar conta';
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar com o servidor. Verifique se o servidor está rodando.');
            submitButton.disabled = false;
            submitButton.textContent = 'Criar conta';
        }
    });
}); 