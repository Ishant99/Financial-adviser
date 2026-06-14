using FinAdvisor.Domain.Entities;
using FinAdvisor.Infrastructure.Persistence;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfCasUploadLogRepository(AppDbContext db) : EfRepository<CasUploadLog>(db);
