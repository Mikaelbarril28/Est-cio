// As tuas chaves do Supabase já configuradas
const SUPABASE_URL = 'https://txrkdqzpjtjbaapuiujt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eHq1sKKH9BRwGYC_1tV2JQ_hJ3_OOq5';

// Carrega o SDK do Supabase automaticamente no navegador
const scriptSupabase = document.createElement('script');
scriptSupabase.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
document.head.appendChild(scriptSupabase);

scriptSupabase.onload = () => {
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Escuta alterações no banco de dados em tempo real (aparece em < 5s)
  supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'agendamentos' },
      () => {
        carregarAgenda(supabase);
      }
    )
    .subscribe();

  // 2. Lógica ao enviar o formulário de agendamento
  document.addEventListener('DOMContentLoaded', () => {
    const formAgendamento = document.querySelector('form');
    
    if (formAgendamento && window.location.pathname.includes('agendamentos.html')) {
      formAgendamento.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const inputs = formAgendamento.querySelectorAll('input, select, textarea');
        const novoAgendamento = {
          cliente: inputs[0].value,
          servico: inputs[1].value,
          data: inputs[2].value,
          horario: inputs[3].value
        };

        if (!novoAgendamento.cliente) {
          alert('Preenche o nome do cliente!');
          return;
        }

        // Salva direto na nuvem do Supabase
        const { error } = await supabase.from('agendamentos').insert([novoAgendamento]);

        if (error) {
          alert('Erro ao agendar: ' + error.message);
        } else {
          alert('Agendamento realizado com sucesso!');
          formAgendamento.reset();
        }
      });

      carregarAgenda(supabase);
    }
  });
};

// 3. Função para carregar a lista de agendamentos vinda do Supabase
async function carregarAgenda(supabase) {
  const containerAgenda = document.querySelector('.grid-2 section:last-child');
  if (!containerAgenda) return;

  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select('*')
    .order('id', { ascending: false });

  if (error || !agendamentos || agendamentos.length === 0) {
    containerAgenda.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>📋 Agenda da Recepção</h2>
        <span style="font-size: 11px; color: var(--accent-green);">⚡ Nuvem Realtime Ativa</span>
      </div>
      <div class="empty-state">Nenhum agendamento encontrado.</div>
    `;
    return;
  }

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h2>📋 Agenda da Recepção (${agendamentos.length})</h2>
      <span style="font-size: 11px; color: var(--accent-green);">⚡ Nuvem Realtime Ativa</span>
    </div>
  `;

  agendamentos.forEach((item) => {
    html += `
      <div style="background: var(--input-bg); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border-color);">
        <strong>${item.cliente}</strong> - ${item.servico}<br>
        <small style="color: var(--text-secondary);">📅 ${item.data} às ${item.horario}</small>
      </div>
    `;
  });

  containerAgenda.innerHTML = html;
}