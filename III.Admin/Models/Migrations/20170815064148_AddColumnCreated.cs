using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class AddColumnCreated : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBResource",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBResource",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBGroupUser",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBGroupUser",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBFunction",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBFunction",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBApplication",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBApplication",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "AspNetUsers",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "AspNetUsers",
                maxLength: 50,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBGroupUser");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBGroupUser");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBFunction");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBFunction");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "AspNetUsers");
        }
    }
}
