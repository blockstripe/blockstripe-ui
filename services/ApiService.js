const API_HOST = 'http://localhost'
const API_URL = process.env.API_URL || `${API_HOST}:3002`;

class ApiService {
    static scheduleTenantExecution(frequency, dateOrMonth, lastTenantExecutableId) {
        return fetch(API_URL + '/', {
            method: 'POST',
            body: JSON.stringify({
                tenant_executable_id: lastTenantExecutableId,
                recurrence_rule_config: {
                    frequency,
                    dateOrMonth,
                },
            }),
        });
    }
}

export default ApiService;
