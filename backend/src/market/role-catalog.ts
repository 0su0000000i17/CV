type RoleCatalogEntry = {
  id: string;
  text: string;
  aliases: string[];
};

const roleCatalog: RoleCatalogEntry[] = [
  { id: "backend-developer", text: "Backend-разработчик", aliases: ["back", "backend", "бэкенд", "бекенд", "server developer"] },
  { id: "frontend-developer", text: "Frontend-разработчик", aliases: ["front", "frontend", "фронтенд", "фронт"] },
  { id: "fullstack-developer", text: "Fullstack-разработчик", aliases: ["fullstack", "full stack", "фулстек"] },
  { id: "mobile-developer", text: "Мобильный разработчик", aliases: ["mobile", "android", "ios", "мобильная разработка"] },
  { id: "android-developer", text: "Android-разработчик", aliases: ["android developer", "kotlin developer"] },
  { id: "ios-developer", text: "iOS-разработчик", aliases: ["ios developer", "swift developer"] },
  { id: "qa-engineer", text: "QA-инженер", aliases: ["qa", "quality assurance", "тестировщик", "тестирование"] },
  { id: "qa-automation", text: "Инженер по автоматизации тестирования", aliases: ["qa automation", "auto qa", "автотесты", "sdet"] },
  { id: "manual-qa", text: "Тестировщик ПО", aliases: ["manual qa", "ручной тестировщик", "тестировщик программного обеспечения"] },
  { id: "devops-engineer", text: "DevOps-инженер", aliases: ["devops", "девопс", "ci cd", "platform engineer"] },
  { id: "sre-engineer", text: "SRE-инженер", aliases: ["sre", "site reliability", "надежность"] },
  { id: "system-administrator", text: "Системный администратор", aliases: ["сисадмин", "system administrator", "администратор систем"] },
  { id: "network-engineer", text: "Сетевой инженер", aliases: ["network engineer", "сетевой администратор", "сети"] },
  { id: "security-engineer", text: "Инженер информационной безопасности", aliases: ["security", "cybersecurity", "иб", "кибербезопасность"] },
  { id: "data-analyst", text: "Аналитик данных", aliases: ["data analyst", "аналитик данных", "аналитика данных"] },
  { id: "data-scientist", text: "Data Scientist", aliases: ["data science", "дата сайентист", "ml researcher"] },
  { id: "data-engineer", text: "Data Engineer", aliases: ["data engineer", "инженер данных", "etl developer"] },
  { id: "ml-engineer", text: "ML-инженер", aliases: ["machine learning", "ml engineer", "машинное обучение"] },
  { id: "ai-engineer", text: "AI-инженер", aliases: ["ai engineer", "ии инженер", "llm engineer", "generative ai"] },
  { id: "bi-analyst", text: "BI-аналитик", aliases: ["bi", "business intelligence", "power bi", "tableau"] },
  { id: "business-analyst", text: "Бизнес-аналитик", aliases: ["business analyst", "бизнес аналитик"] },
  { id: "system-analyst", text: "Системный аналитик", aliases: ["system analyst", "системный аналитик"] },
  { id: "product-analyst", text: "Продуктовый аналитик", aliases: ["product analyst", "продуктовая аналитика"] },
  { id: "financial-analyst", text: "Финансовый аналитик", aliases: ["finance analyst", "финансовый анализ"] },
  { id: "product-manager", text: "Product Manager", aliases: ["product manager", "продакт", "менеджер продукта"] },
  { id: "project-manager", text: "Project Manager", aliases: ["project manager", "проджект", "руководитель проектов"] },
  { id: "program-manager", text: "Program Manager", aliases: ["program manager", "руководитель программ"] },
  { id: "scrum-master", text: "Scrum Master", aliases: ["scrum", "скрам мастер", "agile coach"] },
  { id: "business-development", text: "Менеджер по развитию бизнеса", aliases: ["business development", "bizdev", "бизнес развитие"] },
  { id: "sales-manager", text: "Менеджер по продажам", aliases: ["sales", "продажи", "sales manager"] },
  { id: "account-manager", text: "Аккаунт-менеджер", aliases: ["account manager", "аккаунт", "клиентский менеджер"] },
  { id: "customer-success", text: "Customer Success Manager", aliases: ["customer success", "csm", "успех клиентов"] },
  { id: "support-specialist", text: "Специалист технической поддержки", aliases: ["support", "technical support", "техподдержка", "поддержка"] },
  { id: "call-center", text: "Оператор контактного центра", aliases: ["call center", "колл центр", "оператор поддержки"] },
  { id: "marketing-manager", text: "Менеджер по маркетингу", aliases: ["marketing", "маркетолог", "marketing manager"] },
  { id: "performance-marketer", text: "Performance-маркетолог", aliases: ["performance", "перформанс", "таргетолог"] },
  { id: "digital-marketer", text: "Digital-маркетолог", aliases: ["digital marketing", "диджитал маркетолог"] },
  { id: "crm-marketer", text: "CRM-маркетолог", aliases: ["crm marketing", "email marketing", "retention"] },
  { id: "seo-specialist", text: "SEO-специалист", aliases: ["seo", "сео", "поисковое продвижение"] },
  { id: "smm-specialist", text: "SMM-специалист", aliases: ["smm", "социальные сети", "social media"] },
  { id: "content-manager", text: "Контент-менеджер", aliases: ["content manager", "контент"] },
  { id: "copywriter", text: "Копирайтер", aliases: ["copywriter", "редактор", "тексты"] },
  { id: "pr-manager", text: "PR-менеджер", aliases: ["pr", "пиар", "public relations"] },
  { id: "ux-ui-designer", text: "UX/UI-дизайнер", aliases: ["ux", "ui", "ux ui", "веб дизайнер", "product designer"] },
  { id: "graphic-designer", text: "Графический дизайнер", aliases: ["graphic designer", "графический дизайн"] },
  { id: "motion-designer", text: "Motion-дизайнер", aliases: ["motion", "моушн", "motion design"] },
  { id: "web-designer", text: "Веб-дизайнер", aliases: ["web designer", "web design", "веб дизайн"] },
  { id: "hr-manager", text: "HR-менеджер", aliases: ["hr", "эйчар", "human resources"] },
  { id: "recruiter", text: "IT-рекрутер", aliases: ["recruiter", "рекрутер", "talent acquisition", "it recruiter"] },
  { id: "hr-business-partner", text: "HR Business Partner", aliases: ["hrbp", "hr business partner"] },
  { id: "lawyer", text: "Юрист", aliases: ["lawyer", "legal counsel", "юрисконсульт"] },
  { id: "accountant", text: "Бухгалтер", aliases: ["accountant", "бухгалтерия"] },
  { id: "economist", text: "Экономист", aliases: ["economist", "экономика"] },
  { id: "operations-manager", text: "Операционный менеджер", aliases: ["operations", "операционный менеджмент", "операционный директор"] },
  { id: "procurement-manager", text: "Менеджер по закупкам", aliases: ["procurement", "закупки", "снабжение"] },
  { id: "logistics-manager", text: "Менеджер по логистике", aliases: ["logistics", "логист", "логистика"] },
  { id: "warehouse-manager", text: "Руководитель склада", aliases: ["warehouse", "склад", "начальник склада"] },
  { id: "office-manager", text: "Офис-менеджер", aliases: ["office manager", "администратор офиса"] },
  { id: "executive-assistant", text: "Бизнес-ассистент", aliases: ["assistant", "executive assistant", "личный помощник"] },
  { id: "sales-director", text: "Директор по продажам", aliases: ["sales director", "руководитель продаж", "роп"] },
  { id: "commercial-director", text: "Коммерческий директор", aliases: ["commercial director", "коммерческий"] },
  { id: "chief-technology-officer", text: "CTO", aliases: ["cto", "технический директор", "chief technology officer"] },
  { id: "chief-product-officer", text: "CPO", aliases: ["cpo", "директор по продукту", "chief product officer"] },
  { id: "chief-financial-officer", text: "CFO", aliases: ["cfo", "финансовый директор", "chief financial officer"] },
  { id: "doctor", text: "Врач", aliases: ["doctor", "медицина", "врач специалист"] },
  { id: "nurse", text: "Медицинская сестра", aliases: ["nurse", "медсестра", "медбрат"] },
  { id: "pharmacist", text: "Фармацевт", aliases: ["pharmacist", "провизор", "фармация"] },
  { id: "teacher", text: "Преподаватель", aliases: ["teacher", "учитель", "педагог"] },
  { id: "translator", text: "Переводчик", aliases: ["translator", "переводы", "лингвист"] },
  { id: "engineer", text: "Инженер", aliases: ["engineer", "инженер специалист"] },
  { id: "mechanical-engineer", text: "Инженер-механик", aliases: ["mechanical engineer", "механик"] },
  { id: "design-engineer", text: "Инженер-конструктор", aliases: ["design engineer", "конструктор", "cad"] },
  { id: "process-engineer", text: "Инженер-технолог", aliases: ["process engineer", "технолог", "производство"] },
  { id: "architect", text: "Архитектор", aliases: ["architect", "архитектура"] },
  { id: "driver", text: "Водитель", aliases: ["driver", "водитель экспедитор"] },
  { id: "courier", text: "Курьер", aliases: ["courier", "доставка"] },
  { id: "chef", text: "Повар", aliases: ["chef", "cook", "шеф повар"] },
  { id: "administrator", text: "Администратор", aliases: ["administrator", "администратор центра", "ресепшен"] },
];

function normalize(value: string) {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("ru-RU");
}

function getMatchScore(entry: RoleCatalogEntry, query: string) {
  const variants = [entry.text, ...entry.aliases].map(normalize);
  if (variants.some((variant) => variant === query)) return 0;
  if (variants.some((variant) => variant.startsWith(query))) return 1;
  if (variants.some((variant) => variant.split(/[-\s/]+/u).some((word) => word.startsWith(query)))) return 2;
  if (variants.some((variant) => variant.includes(query))) return 3;
  return null;
}

export function searchRoleCatalog(query: string) {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];

  return roleCatalog
    .flatMap((entry) => {
      const score = getMatchScore(entry, normalizedQuery);
      return score === null ? [] : [{ entry, score }];
    })
    .sort(
      (left, right) =>
        left.score - right.score ||
        left.entry.text.localeCompare(right.entry.text, "ru")
    )
    .slice(0, 16)
    .map(({ entry }) => ({ id: `catalog-${entry.id}`, text: entry.text }));
}
