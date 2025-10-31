document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 1. VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
    // =========================================
    
    // Variáveis de estado global (serão carregadas do localStorage)
    let isAuthenticated = false;
    let isAdmin = false;
    let user = {};

    // ID para garantir que cada toast seja único
    let nextToastId = 0;
    
    // Configurações de usuário padrão para o localStorage
    const DEFAULT_USER = {
        name: "Visitante",
        role: "guest",
    };

    // --- Seletores de Elementos (Cache) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    const loginForm = document.getElementById('login-form');
    
    // Inicializa o container de Toast
    const toastContainer = document.getElementById('toast-container') || (() => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        document.body.appendChild(div);
        return div;
    })();


    // =========================================
    // 2. FUNÇÕES CORE: TOAST E PERSISTÊNCIA
    // =========================================
    
    /**
     * Exibe uma notificação Toast na tela, substituindo o alert().
     * @param {string} message - Mensagem a ser exibida.
     * @param {string} type - Tipo: 'success', 'error', 'info' (padrão).
     * @param {number} duration - Duração em ms.
     */
    function showToast(message, type = 'info', duration = 4000) {
        const toastId = `toast-${nextToastId++}`;
        const iconMap = {
            'success': '&#10003;', // Checkmark
            'error': '&#10007;',   // X
            'info': '&#9432;',     // Circled I
        };
        const icon = iconMap[type] || iconMap['info'];
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.prepend(toast); // Adiciona no topo para empilhamento
        
        void toast.offsetWidth; // Força o reflow para garantir a animação
        
        toast.classList.add('show');

        // Timer para remover o toast
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove o elemento após a transição de saída
            toast.addEventListener('transitionend', () => {
                if (!toast.classList.contains('show')) {
                    toast.remove();
                }
            }, { once: true });
        }, duration);
    }
    
    /**
     * Carrega o estado de login do localStorage.
     */
    function loadAuthStatus() {
        try {
            const storedUser = localStorage.getItem('cineclubeUser');
            if (storedUser) {
                user = JSON.parse(storedUser);
                isAuthenticated = user.role !== 'guest';
                isAdmin = user.role === 'admin';
            } else {
                user = DEFAULT_USER;
            }
        } catch (e) {
            console.error("Erro ao carregar status do localStorage:", e);
            user = DEFAULT_USER;
        }
    }

    /**
     * Salva o estado de login no localStorage.
     */
    function saveAuthStatus() {
        localStorage.setItem('cineclubeUser', JSON.stringify(user));
    }


    // =========================================
    // 3. CONTROLE DE AUTENTICAÇÃO E UI
    // =========================================

    /**
     * Atualiza a interface (links, mensagens, visibilidade) com base no estado.
     */
    function updateUI() {
        const sidebarLogoutBtn = document.querySelector('.sidebar .logout');
        
        if (isAuthenticated) {
            sidebarLogoutBtn.textContent = 'Sair';
            sidebarLogoutBtn.href = "#"; 
            sidebarLogoutBtn.removeEventListener('click', handleLogout);
            sidebarLogoutBtn.addEventListener('click', handleLogout);
            
            // Esconde o botão de login mobile e links de login no índice
            document.querySelectorAll('a[href="login.html"]').forEach(el => {
                if (!el.classList.contains('logout')) {
                    el.style.display = 'none';
                }
            });
            
            // Personaliza o Dashboard
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

        // Garante que o link de pedidos está no menu
        const nav = document.querySelector('.sidebar nav');
        if (nav && !document.getElementById('pedidos-link')) {
            const linkHTML = '<a href="pedidos.html" id="pedidos-link">🛒 Pedidos</a>';
            nav.insertAdjacentHTML('beforeend', linkHTML);
        }
    }

    /**
     * Lida com a submissão do formulário de Login.
     */
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('senha-login').value;
        
        let success = false;
        
        // Simulação de verificação de credenciais
        if (email === 'admin@clube.com' && password === '123456') {
            isAuthenticated = true;
            isAdmin = true;
            user.name = "Administrador";
            user.role = "admin";
            success = true;
        } else if (email === 'membro@clube.com' && password === '123456') {
            isAuthenticated = true;
            isAdmin = false;
            user.name = "Maria Membro";
            user.role = "member";
            success = true;
        } 
        
        if (success) {
            saveAuthStatus(); // Salva no localStorage
            showToast(`Login de ${user.name} bem-sucedido!`, 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 5000);
        } else {
            showToast("Erro: E-mail ou senha incorretos.", 'error');
        }
        
        updateUI();
    }
    
    /**
     * Lida com o processo de Logout.
     */
    function handleLogout(event) {
        event.preventDefault();
        isAuthenticated = false;
        isAdmin = false;
        user = DEFAULT_USER;
        saveAuthStatus(); // Salva o estado deslogado
        showToast("Você foi desconectado(a).", 'info');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        updateUI();
    }
    
    // Adiciona o listener de login se o formulário existir
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    
    // =========================================
    // 4. FUNCIONALIDADE DA SIDEBAR
    // =========================================
    
    /**
     * Gerencia a abertura e o fechamento da barra lateral.
     */
    function toggleSidebar() {
        if (!sidebar) return;
        sidebar.classList.toggle('active');
        const isOpen = sidebar.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
        
        // Controle de scroll no corpo (Mobile)
        document.body.style.overflow = isOpen && window.innerWidth < 1024 ? 'hidden' : 'auto';
    }

    menuToggle?.addEventListener('click', toggleSidebar);
    sidebarClose?.addEventListener('click', toggleSidebar);

    // Fecha a sidebar ao clicar em um link
    sidebar?.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                toggleSidebar();
            }
        });
    });
    
    
    // =========================================
    // 5. INTERAÇÕES DE SESSÃO (Dashboard/Votação)
    // =========================================

    // Confirmação de Presença
    document.querySelector('.btn-confirmar-presenca')?.addEventListener('click', (event) => {
        if (!isAuthenticated) {
            showToast("Você precisa fazer login para confirmar presença.", 'info');
            return;
        }
        
        const confirmBtn = event.currentTarget;
        const currentText = confirmBtn.textContent;
        
        if (currentText.includes('Confirmar')) {
            confirmBtn.textContent = 'Presença Confirmada ✅';
            confirmBtn.style.backgroundColor = '#5cb85c';
            showToast(`Presença confirmada!`, 'success');
        } else {
             confirmBtn.textContent = 'Confirmar Presença';
             confirmBtn.style.backgroundColor = 'var(--color-primary)';
             showToast(`Confirmação cancelada.`, 'info');
        }
        
    });
    
    // Votação
    document.querySelectorAll('.btn-vote')?.forEach(button => {
        button.addEventListener('click', (event) => {
            if (!isAuthenticated) {
                 showToast("Você precisa fazer login para votar.", 'info');
                 return;
            }
            
            const movieTitle = event.currentTarget.closest('.movie-card').querySelector('h4').textContent;
            
            document.querySelectorAll('.btn-vote').forEach(btn => {
                btn.textContent = 'Voto Registrado';
                btn.disabled = true;
                btn.style.backgroundColor = '#5cb85c';
            });

            showToast(`Voto registrado em: ${movieTitle}`, 'success');
        });
    });
    
    
    // =========================================
    // 6. LÓGICA DA PÁGINA 'PEDIDOS'
    // =========================================
    
    const consultaForm = document.getElementById('consulta-form');
    const realizarPedidoBtn = document.getElementById('realizar-pedido-btn');
    const historicoList = document.getElementById('historico-pedidos');

    if (consultaForm) {
        consultaForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = document.getElementById('consulta-input').value;
            showToast(`Simulando busca por: "${query}"...`, 'info');
            
            setTimeout(() => {
                 showToast(`Consulta concluída. Encontrados 3 resultados para "${query}".`, 'success');
            }, 1500);
        });
    }

    if (realizarPedidoBtn) {
        realizarPedidoBtn.addEventListener('click', () => {
             if (!isAuthenticated) {
                 showToast("Faça login para realizar um pedido.", 'info');
                 return;
             }
             const pedidoId = Math.floor(Math.random() * 1000) + 100;
             const newPedido = {
                 id: pedidoId,
                 item: `Item Solicitado (${new Date().getHours()}:${new Date().getMinutes()})`,
                 status: "Pendente",
                 date: new Date().toLocaleDateString('pt-BR')
             };
             
             addPedidoToHistory(newPedido);
             showToast(`Pedido #${pedidoId} realizado com sucesso! Voce pagou o ingresso?`, 'success');
        });
    }
    
    /**
     * Adiciona um item de pedido ao histórico (simulação).
     */
    function addPedidoToHistory(pedido) {
        if (!historicoList) return;
        
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <strong>Pedido #${pedido.id}</strong>
            <span>Item: ${pedido.item}</span>
            <span class="status status-${pedido.status.toLowerCase()}">${pedido.status}</span>
            <span class="date">${pedido.date}</span>
        `;
        historicoList.prepend(li);
        
        // Mantém a lista apenas com 5 itens para simulação
        if (historicoList.children.length > 5) {
             historicoList.lastChild.remove();
        }
    }


    // =========================================
    // 7. CHAMADA DE INICIALIZAÇÃO
    // =========================================
    loadAuthStatus();
    updateUI();
});