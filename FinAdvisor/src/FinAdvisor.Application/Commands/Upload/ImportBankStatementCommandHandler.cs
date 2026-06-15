using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Upload;

public class ImportBankStatementCommandHandler(ITransactionRepository transactions)
{
    public async Task<BankStatementImportResult> HandleAsync(
        BankStatementParseResult parsed,
        Guid accountId,
        CancellationToken ct = default)
    {
        // Fetch existing transactions for this account to detect duplicates
        var from = parsed.Transactions.Min(t => ParseDate(t.Date)) ?? DateOnly.MinValue;
        var to   = parsed.Transactions.Max(t => ParseDate(t.Date)) ?? DateOnly.MaxValue;
        var existing = await transactions.GetByAccountAndDateRangeAsync(accountId, from, to, ct);

        // Dedup key: date + amount + first 60 chars of description → existing transaction.
        // Keeping the entity (not just the key) lets a re-upload refresh the category when the
        // categorisation rules have improved, without creating duplicate rows.
        var existingByKey = new Dictionary<string, Transaction>(StringComparer.OrdinalIgnoreCase);
        foreach (var t in existing)
            existingByKey[DedupKey(t.Date, t.Amount, t.Description)] = t;

        int imported = 0;
        int updated = 0;
        int skipped = 0;

        foreach (var row in parsed.Transactions)
        {
            var date = ParseDate(row.Date);
            if (date is null) { skipped++; continue; }

            // Each row is either a debit or credit
            var isCredit = row.Credit.HasValue && row.Credit.Value > 0;
            var amount   = isCredit ? row.Credit!.Value : row.Debit ?? 0m;
            if (amount <= 0) { skipped++; continue; }

            var txType = isCredit ? TransactionType.Credit : TransactionType.Debit;
            var key = DedupKey(date.Value, amount, row.Description);

            if (existingByKey.TryGetValue(key, out var existingTxn))
            {
                // Duplicate row — refresh its category if the rules now classify it differently.
                if (!string.Equals(existingTxn.Category, row.Category, StringComparison.OrdinalIgnoreCase))
                {
                    existingTxn.Recategorise(row.Category);
                    await transactions.UpdateAsync(existingTxn, ct);
                    updated++;
                }
                else
                {
                    skipped++;
                }
                continue;
            }

            var txn = Transaction.Create(
                accountId,
                date.Value,
                amount,
                txType,
                row.Category,
                row.Description);

            await transactions.AddAsync(txn, ct);
            existingByKey[key] = txn;
            imported++;
        }

        return new BankStatementImportResult(
            imported, updated, skipped,
            parsed.BankName, parsed.AccountNumber,
            parsed.PeriodFrom, parsed.PeriodTo);
    }

    private static DateOnly? ParseDate(string? iso)
    {
        if (string.IsNullOrWhiteSpace(iso)) return null;
        return DateOnly.TryParse(iso, out var d) ? d : null;
    }

    private static string DedupKey(DateOnly date, decimal amount, string description)
        => $"{date:yyyy-MM-dd}|{amount:F2}|{description[..Math.Min(60, description.Length)]}";
}
