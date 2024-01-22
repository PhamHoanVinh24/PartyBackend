using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class DropColumnCreated : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBResource",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBResource",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBGroupUser",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBGroupUser",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBFunction",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBFunction",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBApplication",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBApplication",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "AspNetUsers",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "AspNetUsers",
                nullable: true);
        }
    }
}
