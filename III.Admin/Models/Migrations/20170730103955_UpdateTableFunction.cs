using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class UpdateTableFunction : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VIBAppFunction",
                columns: table => new
                {
                    ApplicationId = table.Column<int>(nullable: false),
                    FunctionId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBAppFunction", x => new { x.ApplicationId, x.FunctionId });
                    table.ForeignKey(
                        name: "FK_VIBAppFunction_VIBApplication_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "VIBApplication",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBAppFunction_VIBFunction_FunctionId",
                        column: x => x.FunctionId,
                        principalTable: "VIBFunction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VIBAppFunction_FunctionId",
                table: "VIBAppFunction",
                column: "FunctionId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIBAppFunction");
        }
    }
}
