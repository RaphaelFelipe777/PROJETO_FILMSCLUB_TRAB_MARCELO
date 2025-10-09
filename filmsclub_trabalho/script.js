document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais de Estado ---
    let isAuthenticated = false;
    let isAdmin = false;
    
    // Simula dados do usuário (em uma aplicação real, viria do servidor)
    const user = {
        name: "João Silva",
        role: "member", // ou "admin"
    };

    // --- Seletores de Elementos (CACHE) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    const mainContent = document.querySelector('.main-content');
    const loginForm = document.getElementById('login-form');
    
    // --- 1. Controle de Autenticação e UI ---
    
    /**
     * Atualiza o estado da UI (links e visibilidade) com base no status do usuário.
     */
    function updateUI() {
        // Altera o link do botão Sair/Login na Sidebar
        const sidebarLogoutBtn = document.querySelector('.sidebar .logout');
        
        if (isAuthenticated) {
            sidebarLogoutBtn.textContent = 'Sair';
            sidebarLogoutBtn.href = "#"; // Evita redirecionamento imediato
            sidebarLogoutBtn.addEventListener('click', handleLogout);
            
            // Oculta links de acesso/login (se estiverem visíveis)
            document.querySelectorAll('a[href="login.html"]').forEach(el => {
                if (!el.classList.contains('logout')) {
                    el.style.display = 'none';
                }
            });
            
            // Personaliza a mensagem de boas-vindas no Dashboard (se a página for o dashboard)
            const dashboardHeader = document.querySelector('.dashboard-header h2');
            if (dashboardHeader) {
                dashboardHeader.textContent = `Bem-vindo(a), ${user.name.split(' ')[0]}!`;
            }
            
        } else {
            sidebarLogoutBtn.textContent = 'Entrar / Login';
            sidebarLogoutBtn.href = "login.html";
        }
        
        // Controle de visibilidade do link Admin
        const adminLink = document.querySelector('a[href="admin.html"]');
        if (adminLink) {
             adminLink.style.display = isAdmin ? 'flex' : 'none';
        }
    }

    /**
     * Simula o processo de Login.
     */
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('senha-login').value;
        
        // Simulação de verificação de credenciais (em um backend real, seria uma requisição HTTP)
        if (email === 'admin@clube.com' && password === '123456') {
            isAuthenticated = true;
            isAdmin = true;
            user.name = "Administrador";
            user.role = "admin";
            alert("Login de Administrador bem-sucedido!");
            window.location.href = 'dashboard.html';
        } else if (email === 'membro@clube.com' && password === '123456') {
            isAuthenticated = true;
            isAdmin = false;
            user.name = "Maria Membro";
            user.role = "member";
            alert("Login de Membro bem-sucedido!");
            window.location.href = 'dashboard.html';
        } else {
            alert("Erro: E-mail ou senha incorretos.");
        }
        
        updateUI();
    }
    
    /**
     * Simula o processo de Logout.
     */
    function handleLogout(event) {
        event.preventDefault();
        isAuthenticated = false;
        isAdmin = false;
        alert("Você foi desconectado(a).");
        window.location.href = 'index.html';
        updateUI();
    }
    
    // Adiciona o listener de login se o formulário existir na página
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    
    // --- 2. Funcionalidade da Sidebar (Robusta) ---
    
    /**
     * Gerencia a abertura e o fechamento da barra lateral.
     */
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        const isOpen = sidebar.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
        
        // Controle de scroll no corpo (Mobile)
        document.body.style.overflow = isOpen && window.innerWidth < 1024 ? 'hidden' : 'auto';
    }

    menuToggle?.addEventListener('click', toggleSidebar);
    sidebarClose?.addEventListener('click', toggleSidebar);

    // Fecha a sidebar ao clicar em um link (melhora usabilidade mobile)
    sidebar.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                toggleSidebar();
            }
        });
    });
    
    // --- 3. Interações de Sessão (Simulação) ---

    /**
     * Simula a confirmação de presença para a próxima sessão.
     */
    document.querySelector('.btn-confirmar-presenca')?.addEventListener('click', (event) => {
        if (!isAuthenticated) {
            alert("Você precisa fazer login para confirmar presença.");
            window.location.href = 'login.html';
            return;
        }
        
        // Simulação de requisição POST para o backend
        const confirmBtn = event.currentTarget;
        const currentText = confirmBtn.textContent;
        
        if (currentText.includes('Confirmar')) {
            confirmBtn.textContent = 'Presença Confirmada ✅';
            confirmBtn.style.backgroundColor = '#5cb85c';
            // Emissão de notificação
            simulateNotification(`Presença confirmada para Blade Runner 2049.`);
        } else {
             confirmBtn.textContent = 'Confirmar Presença';
             confirmBtn.style.backgroundColor = 'var(--color-primary)';
        }
        
    });
    
    /**
     * Simula o processo de votação.
     */
    document.querySelectorAll('.btn-vote')?.forEach(button => {
        button.addEventListener('click', (event) => {
            if (!isAuthenticated) {
                 alert("Você precisa fazer login para votar.");
                 window.location.href = 'login.html';
                 return;
            }
            
            // Simula o voto
            const movieTitle = event.currentTarget.closest('.movie-card').querySelector('h4').textContent;
            
            // Desabilita todos os botões de voto após a ação
            document.querySelectorAll('.btn-vote').forEach(btn => {
                btn.textContent = 'Voto Registrado';
                btn.disabled = true;
                btn.style.backgroundColor = '#5cb85c';
            });

            alert(`Voto registrado com sucesso em: ${movieTitle}`);
            simulateNotification(`Seu voto em ${movieTitle} foi registrado.`);
        });
    });
    
    // --- 4. Simulação de Notificações ---
    
    /**
     * Simula a adição de uma notificação na lista do Dashboard.
     */
    function simulateNotification(message) {
        const notificationList = document.querySelector('.notifications ul');
        
        if (notificationList) {
            const newLi = document.createElement('li');
            newLi.innerHTML = `**Alerta:** ${message}`;
            newLi.style.cssText = "border-bottom: 1px solid #333; padding: 8px 0; color: #ffc107;";
            
            // Adiciona como o primeiro item
            notificationList.prepend(newLi);
        }
        
        // Adiciona um pequeno efeito visual (simulando um badge)
        const logo = document.querySelector('.logo');
        logo.style.color = '#ffc107'; 
        setTimeout(() => {
            logo.style.color = 'var(--color-primary)';
        }, 1500);
    }
    
    // Inicialização da UI
    updateUI();
    
});