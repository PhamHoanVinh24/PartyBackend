using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;
using System.Text;

namespace III.Domain.Migrations.Admin
{
    public partial class UpdateTableIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ROLES_NAME",
                table: "ASP_NET_ROLES",
                column: "NORMALIZED_NAME",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ASP_NET_USERS_BRANCH_ID",
                table: "ASP_NET_USERS",
                column: "BRANCH_ID");

            migrationBuilder.CreateIndex(
                name: "IX_USERS_EMAIL",
                table: "ASP_NET_USERS",
                column: "NORMALIZED_EMAIL");

            migrationBuilder.CreateIndex(
                name: "IX_USERS_USER_NAME",
                table: "ASP_NET_USERS",
                column: "NORMALIZED_USER_NAME",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VIB_APP_FUNCTION_APP_CODE",
                table: "VIB_APP_FUNCTION",
                column: "APPLICATION_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_APP_FUNCTION_FUNC_CODE",
                table: "VIB_APP_FUNCTION",
                column: "FUNCTION_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_FUNCTION_PARENT_CODE",
                table: "VIB_FUNCTION",
                column: "PARENT_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_GROUP_USER_PARENT_CODE",
                table: "VIB_GROUP_USER",
                column: "PARENT_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_LANGUAGE_TEXT_LANG_ID",
                table: "VIB_LANGUAGE_TEXT",
                column: "LANGUAGE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_ORG_PARENT_CODE",
                table: "VIB_ORGANIZATION",
                column: "ORG_PARENT_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PARAMETER_PARENT_CODE",
                table: "VIB_PARAMETER",
                column: "PARENT_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PERMISSION_APP_CODE",
                table: "VIB_PERMISSION",
                column: "APPLICATION_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PERMISSION_FUNC_CODE",
                table: "VIB_PERMISSION",
                column: "FUNCTION_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PERMISSION_GROUP_CODE",
                table: "VIB_PERMISSION",
                column: "GROUP_USER_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PERMISSION_RES_CODE",
                table: "VIB_PERMISSION",
                column: "RESOURCE_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PERMISSION_ROLE_ID",
                table: "VIB_PERMISSION",
                column: "ROLE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PERMISSION_USER_ID",
                table: "VIB_PERMISSION",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PRIVILEGE_FUNC_CODE",
                table: "VIB_PRIVILEGE",
                column: "FUNCTION_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_PRIVILEGE_RES_CODE",
                table: "VIB_PRIVILEGE",
                column: "RESOURCE_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_RESOURCE_PARENT_CODE",
                table: "VIB_RESOURCE",
                column: "PARENT_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_USER_IN_GROUP_APP_CODE",
                table: "VIB_USER_IN_GROUP",
                column: "APPLICATION_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_USER_IN_GROUP_CODE",
                table: "VIB_USER_IN_GROUP",
                column: "GROUP_USER_CODE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_USER_IN_GROUP_ROLE_ID",
                table: "VIB_USER_IN_GROUP",
                column: "ROLE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_USER_IN_GROUP_USER_ID",
                table: "VIB_USER_IN_GROUP",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_ASP_NET_ROLE_CLAIMS_ROLE",
                table: "ASP_NET_ROLE_CLAIMS",
                column: "ROLE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_ASP_NET_USER_CLAIMS_USER",
                table: "ASP_NET_USER_CLAIMS",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_ASP_NET_USER_LOGINS_USER",
                table: "ASP_NET_USER_LOGINS",
                column: "USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_ASP_NET_USER_ROLES_ROLE",
                table: "ASP_NET_USER_ROLES",
                column: "ROLE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_ACTION_LOG_CREATED_DATE",
                table: "VIB_ACTION_LOG",
                column: "CREATED_DATE");

            migrationBuilder.CreateIndex(
                name: "IX_VIB_ACTION_LOG_HIST_CREATED",
                table: "VIB_ACTION_LOG_HIST",
                column: "CREATED_DATE");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_VIB_ACTION_LOG_CREATED_DATE",
                table: "VIB_ACTION_LOG");
        }
    }
}
