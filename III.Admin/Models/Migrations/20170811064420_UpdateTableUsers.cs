using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class UpdateTableUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
            //    name: "FK_AspNetUsers_ESOrganizations_OrgId",
            //    table: "AspNetUsers");

            //migrationBuilder.RenameColumn(
            //    name: "OrgId",
            //    table: "AspNetUsers",
            //    newName: "ProfitCenterId");

            //migrationBuilder.RenameIndex(
            //    name: "IX_AspNetUsers_OrgId",
            //    table: "AspNetUsers",
            //    newName: "IX_AspNetUsers_ProfitCenterId");

            migrationBuilder.AddColumn<string>(
                name: "Api",
                table: "VIBResource",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AccountExecutiveId",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Active",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "BranchId",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_AccountExecutiveId",
                table: "AspNetUsers",
                column: "AccountExecutiveId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_BranchId",
                table: "AspNetUsers",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_AccountExecutiveId",
                table: "AspNetUsers",
                column: "AccountExecutiveId",
                principalTable: "VIBOrganization",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_BranchId",
                table: "AspNetUsers",
                column: "BranchId",
                principalTable: "VIBOrganization",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId",
                principalTable: "VIBOrganization",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_ProfitCenterId",
                table: "AspNetUsers",
                column: "ProfitCenterId",
                principalTable: "VIBOrganization",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_AccountExecutiveId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_BranchId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_VIBOrganization_ProfitCenterId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_AccountExecutiveId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_BranchId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Api",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "AccountExecutiveId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Active",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "BranchId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "ProfitCenterId",
                table: "AspNetUsers",
                newName: "OrgId");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_ProfitCenterId",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_OrgId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_ESOrganizations_OrgId",
                table: "AspNetUsers",
                column: "OrgId",
                principalTable: "ESOrganizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
