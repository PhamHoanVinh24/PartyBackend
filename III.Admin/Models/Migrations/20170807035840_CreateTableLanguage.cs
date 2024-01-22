using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class CreateTableLanguage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VIBLanguage",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Culture = table.Column<string>(maxLength: 10, nullable: true),
                    DisplayName = table.Column<string>(maxLength: 256, nullable: true),
                    Icon = table.Column<string>(maxLength: 128, nullable: true),
                    Ordering = table.Column<int>(nullable: false),
                    IsDefault = table.Column<bool>(nullable: true),
                    IsEnabled = table.Column<bool>(nullable: false),
                    CreatedBy = table.Column<int>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: true),
                    DeletedBy = table.Column<int>(nullable: true),
                    DeletedDate = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBLanguage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VIBLanguageText",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Caption = table.Column<string>(maxLength: 500, nullable: true),
                    Value = table.Column<string>(nullable: true),
                    LanguageId = table.Column<int>(nullable: false),
                    CreatedBy = table.Column<int>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    UpdatedBy = table.Column<int>(nullable: true),
                    UpdatedDate = table.Column<DateTime>(nullable: true),
                    DeletedBy = table.Column<int>(nullable: true),
                    DeletedDate = table.Column<DateTime>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBLanguageText", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBLanguageText_VIBLanguage_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "VIBLanguage",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VIBLanguageText_LanguageId",
                table: "VIBLanguageText",
                column: "LanguageId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIBLanguageText");

            migrationBuilder.DropTable(
                name: "VIBLanguage");
        }
    }
}
