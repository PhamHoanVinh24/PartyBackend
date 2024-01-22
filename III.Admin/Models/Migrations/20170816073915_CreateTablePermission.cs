using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class CreateTablePermission : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SecurityStamp",
                table: "AspNetUsers",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "AspNetUsers",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "AspNetUsers",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ConcurrencyStamp",
                table: "AspNetUsers",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "VIBPermission",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ApplicationId = table.Column<int>(nullable: true),
                    FunctionId = table.Column<int>(nullable: true),
                    GroupUserId = table.Column<int>(nullable: true),
                    ResourceId = table.Column<int>(nullable: true),
                    RoleId = table.Column<string>(maxLength: 50, nullable: true),
                    UserId = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBPermission", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBPermission_VIBApplication_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "VIBApplication",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIBPermission_VIBFunction_FunctionId",
                        column: x => x.FunctionId,
                        principalTable: "VIBFunction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIBPermission_VIBGroupUser_GroupUserId",
                        column: x => x.GroupUserId,
                        principalTable: "VIBGroupUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIBPermission_VIBResource_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "VIBResource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIBPermission_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIBPermission_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VIBPermission_ApplicationId",
                table: "VIBPermission",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPermission_FunctionId",
                table: "VIBPermission",
                column: "FunctionId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPermission_GroupUserId",
                table: "VIBPermission",
                column: "GroupUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPermission_ResourceId",
                table: "VIBPermission",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPermission_RoleId",
                table: "VIBPermission",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPermission_UserId",
                table: "VIBPermission",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIBPermission");

            migrationBuilder.AlterColumn<string>(
                name: "SecurityStamp",
                table: "AspNetUsers",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "AspNetUsers",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "AspNetUsers",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ConcurrencyStamp",
                table: "AspNetUsers",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);
        }
    }
}
