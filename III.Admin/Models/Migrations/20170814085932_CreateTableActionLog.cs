using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class CreateTableActionLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBResource",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "VIBResource",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBResource",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
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

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "VIBGroupUser",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBFunction",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "VIBFunction",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBFunction",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "VIBFunction",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AppUrl",
                table: "VIBApplication",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "VIBApplication",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "VIBApplication",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "VIBApplication",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "VIBApplication",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "VIBActionLog",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    LogLevel = table.Column<string>(maxLength: 50, nullable: true),
                    Message = table.Column<string>(maxLength: 2000, nullable: true),
                    CreatedBy = table.Column<string>(maxLength: 255, nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    Browser = table.Column<string>(maxLength: 300, nullable: true),
                    Host = table.Column<string>(maxLength: 100, nullable: true),
                    Path = table.Column<string>(maxLength: 300, nullable: true),
                    IpAddress = table.Column<string>(maxLength: 20, nullable: true),
                    Data = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBActionLog", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIBActionLog");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "VIBResource");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBGroupUser");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBGroupUser");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "VIBGroupUser");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBFunction");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "VIBFunction");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBFunction");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "VIBFunction");

            migrationBuilder.DropColumn(
                name: "AppUrl",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "VIBApplication");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "AspNetUsers");
        }
    }
}
