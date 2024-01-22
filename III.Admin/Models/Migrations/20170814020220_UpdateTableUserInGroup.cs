using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class UpdateTableUserInGroup : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "VIBUserInGroup",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RoleId",
                table: "VIBUserInGroup",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "VIBApplication",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AspNetUsers",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "AspNetUsers",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_VIBUserInGroup_Id",
                table: "VIBUserInGroup",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_VIBUserInGroup_RoleId",
                table: "VIBUserInGroup",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_VIBUserInGroup_AspNetRoles_RoleId",
                table: "VIBUserInGroup",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VIBUserInGroup_AspNetRoles_RoleId",
                table: "VIBUserInGroup");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_VIBUserInGroup_Id",
                table: "VIBUserInGroup");

            migrationBuilder.DropIndex(
                name: "IX_VIBUserInGroup_RoleId",
                table: "VIBUserInGroup");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "VIBUserInGroup");

            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "VIBUserInGroup");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "AspNetUsers");
        }
    }
}
