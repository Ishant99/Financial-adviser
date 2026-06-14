using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinAdvisor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCasUploadLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CasUploadLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    HoldingsImported = table.Column<int>(type: "integer", nullable: false),
                    HoldingsUpdated = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    InvestorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CasUploadLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CasUploadLogs_UploadedAt",
                table: "CasUploadLogs",
                column: "UploadedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CasUploadLogs");
        }
    }
}
