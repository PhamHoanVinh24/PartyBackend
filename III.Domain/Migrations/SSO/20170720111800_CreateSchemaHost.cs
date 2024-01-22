using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Host.DbContexts.Migrations
{
    public partial class CreateSchemaHost : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ESEmailConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 50, nullable: false),
                    Email = table.Column<string>(maxLength: 255, nullable: false),
                    IMAP = table.Column<string>(maxLength: 255, nullable: true),
                    IMAPPort = table.Column<int>(nullable: true),
                    Imapssl = table.Column<bool>(nullable: true),
                    Password = table.Column<string>(maxLength: 255, nullable: true),
                    POP3 = table.Column<string>(maxLength: 255, nullable: true),
                    POP3Port = table.Column<int>(nullable: true),
                    Pop3ssl = table.Column<bool>(nullable: true),
                    SMTP = table.Column<string>(maxLength: 255, nullable: true),
                    SMTPPort = table.Column<int>(nullable: true),
                    Smtpssl = table.Column<bool>(nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESEmailConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESEmailInBoxs",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Body = table.Column<string>(type: "long", nullable: true),
                    From = table.Column<string>(maxLength: 255, nullable: true),
                    IdEmail = table.Column<string>(maxLength: 255, nullable: true),
                    SendDate = table.Column<DateTime>(type: "date", nullable: true),
                    Subject = table.Column<string>(maxLength: 255, nullable: true),
                    To = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESEmailInBoxs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESMessageQueue",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Body = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "date", nullable: true),
                    Subject = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESMessageQueue", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESMessageAttribute",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Key = table.Column<string>(maxLength: 50, nullable: false),
                    MessageQueueId = table.Column<int>(nullable: false),
                    Value = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESMessageAttribute", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESMessageAttribute_ESMessageQueue",
                        column: x => x.MessageQueueId,
                        principalTable: "ESMessageQueue",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ESMessageReceiver",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Email = table.Column<string>(maxLength: 255, nullable: true),
                    MessageQueueId = table.Column<int>(nullable: false),
                    Mobile = table.Column<string>(maxLength: 20, nullable: true),
                    S1 = table.Column<int>(nullable: false),
                    S2 = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESMessageReceiver", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESMessageReceiver_ESMessageQueue",
                        column: x => x.MessageQueueId,
                        principalTable: "ESMessageQueue",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ESMessageAttribute_MessageQueueId",
                table: "ESMessageAttribute",
                column: "MessageQueueId");

            migrationBuilder.CreateIndex(
                name: "IX_ESMessageReceiver_MessageQueueId",
                table: "ESMessageReceiver",
                column: "MessageQueueId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ESEmailConfigs");

            migrationBuilder.DropTable(
                name: "ESEmailInBoxs");

            migrationBuilder.DropTable(
                name: "ESMessageAttribute");

            migrationBuilder.DropTable(
                name: "ESMessageReceiver");

            migrationBuilder.DropTable(
                name: "ESMessageQueue");
        }
    }
}
