const { useState, useEffect, useCallback } = React;

const API_USERS = 'http://192.168.1.84:8080';
const API_TASKS = 'http://192.168.1.84:8000';

// ── TOAST ──────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const wrap = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'success' ? 'ti-check' : 'ti-alert-circle';
    const color = type === 'success' ? '#22C55E' : '#EF4444';
    el.innerHTML = `<i class="ti ${icon}" style="color:${color};font-size:16px"></i><span>${msg}</span>`;
    wrap.appendChild(el);
    setTimeout(() => el.style.opacity = '0', 2800);
    setTimeout(() => el.remove(), 3300);
}

// ── CONSTANTS ──────────────────────────────────────────────────────
const STATUS_MAP = {
    'pendente':     { label: 'Pendente',     cls: 'badge-pending',  cardCls: '' },
    'em progresso': { label: 'Em progresso', cls: 'badge-progress', cardCls: 'in-progress' },
    'concluido':    { label: 'Concluído',    cls: 'badge-done',     cardCls: 'done' },
    'cancelado':    { label: 'Cancelado',    cls: 'badge-cancelled',cardCls: 'cancelled' },
};

function formatDate(str) {
    if (!str) return '';
    try { return new Date(str).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return ''; }
}

// ── LOGIN PAGE ─────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const submit = async () => {
        if (!username.trim() || !password.trim()) return;
        setLoading(true);
        setError('');
        try {
            const r = await fetch(`${API_USERS}/LoginUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await r.json();
            if (r.ok && data.Success) {
                sessionStorage.setItem('user', JSON.stringify(data.User));
                sessionStorage.setItem('token', data.Token);
                onLogin(data.User);
            } else {
                setError(data.Error || 'Credenciais inválidas');
            }
        } catch {
            setError('Sem ligação ao servidor. Verifica se o servidor está ativo.');
        }
        setLoading(false);
    };

    const onKey = e => e.key === 'Enter' && submit();

    return React.createElement('div', { className: 'login-page' },
        React.createElement('div', { className: 'login-card' },
            React.createElement('div', { className: 'login-logo' }, '⬡ TaskFlow'),
            React.createElement('p', { className: 'login-sub' }, 'Inicia sessão para gerir as tuas tarefas'),
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Utilizador ou Email'),
                React.createElement('div', { className: 'input-wrap' },
                    React.createElement('i', { className: 'ti ti-user' }),
                    React.createElement('input', {
                        className: 'form-input',
                        placeholder: 'O teu username ou email',
                        value: username,
                        onChange: e => setUsername(e.target.value),
                        onKeyDown: onKey,
                        autoFocus: true,
                        autoComplete: 'username'
                    })
                )
            ),
            React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Password'),
                React.createElement('div', { className: 'input-wrap' },
                    React.createElement('i', { className: 'ti ti-lock' }),
                    React.createElement('input', {
                        className: 'form-input',
                        type: 'password',
                        placeholder: '••••••••',
                        value: password,
                        onChange: e => setPassword(e.target.value),
                        onKeyDown: onKey,
                        autoComplete: 'current-password'
                    })
                )
            ),
            error && React.createElement('div', { className: 'login-error' },
                React.createElement('i', { className: 'ti ti-alert-circle', style: { fontSize: '16px', flexShrink: 0 } }),
                error
            ),
            React.createElement('button', {
                    className: 'btn-login',
                    onClick: submit,
                    disabled: !username.trim() || !password.trim() || loading
                },
                loading
                    ? React.createElement(React.Fragment, null, React.createElement('div', { className: 'spinner', style: { width: '18px', height: '18px', borderWidth: '2px' } }), 'A entrar...')
                    : React.createElement(React.Fragment, null, React.createElement('i', { className: 'ti ti-login' }), 'Entrar')
            )
        )
    );
}

// ── TASK CARD ──────────────────────────────────────────────────────
function TaskCard({ task, onDelete, onStatusChange }) {
    const estado = task.estado?.toLowerCase() || 'pendente';
    const s = STATUS_MAP[estado] || STATUS_MAP['pendente'];
    const isDone = estado === 'concluido';

    return React.createElement('div', { className: `task-card ${s.cardCls}` },
        React.createElement('button', {
            className: 'check-btn',
            onClick: () => onStatusChange(task.id, isDone ? 'pendente' : 'concluido'),
            title: isDone ? 'Marcar pendente' : 'Marcar concluído'
        }, isDone ? React.createElement('i', { className: 'ti ti-check' }) : null),

        React.createElement('div', { className: 'task-content' },
            React.createElement('div', { className: 'task-name' }, task.nome),
            task.descricao && React.createElement('div', { className: 'task-desc' }, task.descricao),
            React.createElement('div', { className: 'task-meta' },
                React.createElement('span', { className: `badge ${s.cls}` }, s.label),
                task.categoria && React.createElement('span', { className: 'cat-badge' }, task.categoria),
                React.createElement('span', { className: 'task-date' }, formatDate(task.created_at))
            )
        ),
        React.createElement('div', { className: 'task-actions' },
            React.createElement('select', {
                    className: 'status-select',
                    value: estado,
                    onChange: e => onStatusChange(task.id, e.target.value)
                },
                Object.keys(STATUS_MAP).map(k =>
                    React.createElement('option', { key: k, value: k }, STATUS_MAP[k].label)
                )
            ),
            React.createElement('button', {
                className: 'action-btn danger',
                onClick: () => onDelete(task.id),
                title: 'Eliminar'
            }, React.createElement('i', { className: 'ti ti-trash' }))
        )
    );
}

// ── NEW TASK MODAL ─────────────────────────────────────────────────
    function NewTaskModal({ userId, token, onClose, onCreated }) {
        const [nome, setNome]   = useState('');
        const [desc, setDesc]   = useState('');
        const [cat, setCat]     = useState('');
        const [loading, setLoading] = useState(false);

        const submit = async () => {
            if (!nome.trim()) return;
            setLoading(true);
            try {
                const params = new URLSearchParams({ user_id: userId, nome, descricao: desc, categoria: cat });
                // 2️⃣ Adiciona o header Authorization
                const r = await fetch(`${API_TASKS}/CREATETASK?${params}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (r.ok) { showToast('Tarefa criada!'); onCreated(); }
                else showToast('Erro ao criar tarefa', 'error');
            } catch { showToast('Sem ligação ao servidor', 'error'); }
            setLoading(false);
        };

    return React.createElement('div', { className: 'overlay', onClick: e => e.target === e.currentTarget && onClose() },
        React.createElement('div', { className: 'modal' },
            React.createElement('h2', { className: 'modal-title' }, '✦ Nova tarefa'),
            React.createElement('div', { className: 'form-group-modal' },
                React.createElement('label', { className: 'form-label-modal' }, 'Nome *'),
                React.createElement('input', { className: 'form-input-modal', placeholder: 'Ex: Reunião com cliente', value: nome, onChange: e => setNome(e.target.value), autoFocus: true })
            ),
            React.createElement('div', { className: 'form-group-modal' },
                React.createElement('label', { className: 'form-label-modal' }, 'Descrição'),
                React.createElement('textarea', { className: 'form-textarea-modal', placeholder: 'Detalhes adicionais...', value: desc, onChange: e => setDesc(e.target.value) })
            ),
            React.createElement('div', { className: 'form-group-modal' },
                React.createElement('label', { className: 'form-label-modal' }, 'Categoria'),
                React.createElement('input', { className: 'form-input-modal', placeholder: 'Ex: Trabalho, Pessoal, Urgente...', value: cat, onChange: e => setCat(e.target.value) })
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { className: 'btn-cancel', onClick: onClose }, 'Cancelar'),
                React.createElement('button', { className: 'btn-submit', onClick: submit, disabled: !nome.trim() || loading },
                    loading ? 'A criar...' : 'Criar tarefa'
                )
            )
        )
    );
}

// ── MAIN APP ───────────────────────────────────────────────────────
function App() {
    const [user, setUser]         = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; }
    });
    const [tasks, setTasks]       = useState([]);
    const [loading, setLoading]   = useState(false);
    const [filter, setFilter]     = useState('todas');
    const [search, setSearch]     = useState('');
    const [showModal, setShowModal] = useState(false);
    const token = sessionStorage.getItem('token');

    const authHeaders = {
        'Authorization': `Bearer ${token}`
    };

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const r = await fetch(`${API_TASKS}/TASKS?user_id=${user.id}`, {headers: authHeaders});
            const data = await r.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch {
            showToast('Erro ao carregar tarefas', 'error');
            setTasks([]);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleLogin = u => setUser(u);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        setUser(null);
        setTasks([]);
    };

    const handleDelete = async id => {
        if (!confirm('Eliminar esta tarefa?')) return;
        try {
            const r = await fetch(`${API_TASKS}/DELETETASK?id=${id}`, { method: 'DELETE', headers: authHeaders });
            if (r.ok) { showToast('Tarefa eliminada'); setTasks(t => t.filter(x => x.id !== id)); }
            else showToast('Erro ao eliminar', 'error');
        } catch { showToast('Sem ligação', 'error'); }
    };

    const handleStatusChange = async (id, estado) => {
        try {
            const r = await fetch(`${API_TASKS}/UPDATETASK?id=${id}&estado=${encodeURIComponent(estado)}`, { method: 'PUT', headers: authHeaders });
            if (r.ok) { showToast('Estado atualizado'); setTasks(t => t.map(x => x.id === id ? { ...x, estado } : x)); }
            else showToast('Erro ao atualizar', 'error');
        } catch { showToast('Sem ligação', 'error'); }
    };

    // ── RENDER LOGIN ──
    if (!user) return React.createElement(LoginPage, { onLogin: handleLogin });

    // ── FILTER ──
    const filtered = tasks.filter(t => {
        const matchFilter = filter === 'todas' || t.estado?.toLowerCase() === filter;
        const q = search.toLowerCase();
        const matchSearch = !q || [t.nome, t.descricao, t.categoria].some(v => v?.toLowerCase().includes(q));
        return matchFilter && matchSearch;
    });

    const counts = {
        todas:     tasks.length,
        concluido: tasks.filter(t => t.estado?.toLowerCase() === 'concluido').length,
        pendente:  tasks.filter(t => !t.estado || t.estado.toLowerCase() === 'pendente').length,
    };

    const initial = (user.username || '?')[0].toUpperCase();

    return React.createElement(React.Fragment, null,
        // HEADER
        React.createElement('header', { className: 'app-header' },
            React.createElement('span', { className: 'app-title' }, '⬡ TaskFlow'),
            React.createElement('div', { className: 'header-stats' },
                React.createElement('div', { className: 'stat-pill' }, React.createElement('span', { className: 'dot dot-all' }), React.createElement('strong', null, counts.todas), '\u00a0tarefas'),
                React.createElement('div', { className: 'stat-pill' }, React.createElement('span', { className: 'dot dot-done' }), React.createElement('strong', null, counts.concluido), '\u00a0concluídas'),
                React.createElement('div', { className: 'stat-pill' }, React.createElement('span', { className: 'dot dot-pending' }), React.createElement('strong', null, counts.pendente), '\u00a0pendentes')
            ),
            React.createElement('div', { className: 'header-right' },
                React.createElement('div', { className: 'user-pill' },
                    React.createElement('div', { className: 'user-avatar' }, initial),
                    user.username
                ),
                React.createElement('button', { className: 'btn-logout', onClick: handleLogout, title: 'Terminar sessão' },
                    React.createElement('i', { className: 'ti ti-logout' }), 'Sair'
                )
            )
        ),

        // BODY
        React.createElement('main', { className: 'app-body' },
            React.createElement('div', { className: 'toolbar' },
                React.createElement('div', { className: 'search-wrap' },
                    React.createElement('i', { className: 'ti ti-search' }),
                    React.createElement('input', { type: 'text', className: 'search-input', placeholder: 'Pesquisar tarefas...', value: search, onChange: e => setSearch(e.target.value) })
                ),
                ['todas', 'pendente', 'em progresso', 'concluido', 'cancelado'].map(f =>
                    React.createElement('button', { key: f, className: `filter-btn ${filter === f ? 'active' : ''}`, onClick: () => setFilter(f) },
                        f === 'todas' ? 'Todas' : STATUS_MAP[f]?.label
                    )
                ),
                React.createElement('button', { className: 'btn-new', onClick: () => setShowModal(true) },
                    React.createElement('i', { className: 'ti ti-plus' }), 'Nova tarefa'
                )
            ),

            loading
                ? React.createElement('div', { className: 'loading-wrap' },
                    React.createElement('div', { className: 'spinner' }),
                    React.createElement('span', { style: { fontSize: '14px' } }, 'A carregar tarefas...')
                )
                : filtered.length === 0
                    ? React.createElement('div', { className: 'empty-state' },
                        React.createElement('i', { className: 'ti ti-clipboard-list' }),
                        React.createElement('p', null, search ? 'Nenhuma tarefa encontrada' : 'Ainda não tens tarefas'),
                        React.createElement('span', null, search ? 'Tenta uma pesquisa diferente' : 'Cria a tua primeira tarefa acima')
                    )
                    : React.createElement('div', null,
                        React.createElement('p', { className: 'section-label' }, `${filtered.length} tarefa${filtered.length !== 1 ? 's' : ''}`),
                        React.createElement('div', { className: 'task-list' },
                            filtered.map(t =>
                                React.createElement(TaskCard, { key: t.id, task: t, onDelete: handleDelete, onStatusChange: handleStatusChange })
                            )
                        )
                    )
        ),

        showModal && React.createElement(NewTaskModal, {
            userId: user.id,
            token: token,
            onClose: () => setShowModal(false),
            onCreated: () => { setShowModal(false); fetchTasks(); }
        })


    );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));