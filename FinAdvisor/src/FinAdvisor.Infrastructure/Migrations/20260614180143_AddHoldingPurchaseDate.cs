using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinAdvisor.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHoldingPurchaseDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "PurchaseDate",
                table: "Holdings",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                table: "Holdings");
        }
    }
}
