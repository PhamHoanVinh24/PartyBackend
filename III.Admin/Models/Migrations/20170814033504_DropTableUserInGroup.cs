using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class DropTableUserInGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIBUserInGroup");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VIBUserInGroup",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    GroupUserId = table.Column<int>(nullable: false),
                    Id = table.Column<int>(nullable: false),
                    RoleId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBUserInGroup", x => new { x.UserId, x.GroupUserId });
                    table.UniqueConstraint("AK_VIBUserInGroup_Id", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBUserInGroup_VIBGroupUser_GroupUserId",
                        column: x => x.GroupUserId,
                        principalTable: "VIBGroupUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBUserInGroup_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIBUserInGroup_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VIBUserInGroup_GroupUserId",
                table: "VIBUserInGroup",
                column: "GroupUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBUserInGroup_RoleId",
                table: "VIBUserInGroup",
                column: "RoleId");
        }
    }
}
