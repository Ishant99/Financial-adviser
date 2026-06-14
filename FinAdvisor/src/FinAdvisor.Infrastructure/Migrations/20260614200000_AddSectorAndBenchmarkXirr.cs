using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinAdvisor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSectorAndBenchmarkXirr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Sector",
                table: "Holdings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MarketCapCategory",
                table: "Holdings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BenchmarkXirr",
                table: "SipPlans",
                type: "numeric(8,6)",
                precision: 8,
                scale: 6,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Sector", table: "Holdings");
            migrationBuilder.DropColumn(name: "MarketCapCategory", table: "Holdings");
            migrationBuilder.DropColumn(name: "BenchmarkXirr", table: "SipPlans");
        }
    }
}
