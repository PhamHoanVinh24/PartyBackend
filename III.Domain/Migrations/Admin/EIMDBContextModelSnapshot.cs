using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using ESEIM.Models;

namespace III.Domain.Migrations.Admin1
{
    [DbContext(typeof(EIMDBContext))]
    partial class EIMDBContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.2");

            modelBuilder.Entity("ESEIM.Models.AspNetRole", b =>
            {
                b.Property<string>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID")
                    .HasMaxLength(50);

                b.Property<string>("Code")
                    .HasColumnName("CODE")
                    .HasMaxLength(50);

                b.Property<string>("ConcurrencyStamp")
                    .IsConcurrencyToken()
                    .HasColumnName("CONCURRENCY_STAMP")
                    .HasMaxLength(255);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(2000);

                b.Property<string>("Name")
                    .HasColumnName("NAME")
                    .HasMaxLength(256);

                b.Property<string>("NormalizedName")
                    .HasColumnName("NORMALIZED_NAME")
                    .HasMaxLength(256);

                b.Property<int?>("Ord")
                    .HasColumnName("ORD");

                b.Property<bool>("Status")
                    .HasColumnName("STATUS");

                b.Property<string>("Title")
                    .HasColumnName("TITLE")
                    .HasMaxLength(255);

                b.HasKey("Id")
                    .HasName("PK_ASP_NET_ROLES");

                b.HasIndex("NormalizedName")
                    .IsUnique()
                    .HasName("ROLE_NAME_INDEX");

                b.ToTable("ASP_NET_ROLES");
            });

            modelBuilder.Entity("ESEIM.Models.AspNetUser", b =>
            {
                b.Property<string>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID")
                    .HasMaxLength(50);

                //b.Property<decimal?>("AccessFailedCount")
                //    .HasColumnName("ACCESS_FAILED_COUNT");

                b.Property<string>("AccountExecutiveId")
                    .HasColumnName("ACCOUNT_EXECUTIVE_ID")
                    .HasMaxLength(5);

                b.Property<bool>("Active")
                    .HasColumnName("ACTIVE");

                b.Property<string>("BranchId")
                    .HasColumnName("BRANCH_ID")
                    .HasMaxLength(50);

                b.Property<string>("ConcurrencyStamp")
                    .IsConcurrencyToken()
                    .HasColumnName("CONCURRENCY_STAMP")
                    .HasMaxLength(50);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(2000);

                b.Property<string>("Email")
                    .HasColumnName("EMAIL")
                    .HasMaxLength(256);

                b.Property<bool>("EmailConfirmed")
                    .HasColumnName("EMAIL_CONFIRMED");

                b.Property<string>("EmployeeCode")
                    .HasColumnName("EMPLOYEE_CODE")
                    .HasMaxLength(50);

                b.Property<string>("FamilyName")
                    .HasColumnName("FAMILY_NAME")
                    .HasMaxLength(256);

                b.Property<string>("GivenName")
                    .HasColumnName("GIVEN_NAME")
                    .HasMaxLength(256);

                b.Property<bool>("IsExceeded")
                    .HasColumnName("IS_EXCEEDED");

                b.Property<bool>("LockoutEnabled")
                    .HasColumnName("LOCKOUT_ENABLED");

                b.Property<DateTimeOffset?>("LockoutEnd")
                    .HasColumnName("LOCKOUT_END");

                b.Property<string>("MiddleName")
                    .HasColumnName("MIDDLE_NAME")
                    .HasMaxLength(256);

                b.Property<string>("NormalizedEmail")
                    .HasColumnName("NORMALIZED_EMAIL")
                    .HasMaxLength(256);

                b.Property<string>("NormalizedUserName")
                    .IsRequired()
                    .HasColumnName("NORMALIZED_USER_NAME")
                    .HasMaxLength(256);

                b.Property<string>("Note")
                    .HasColumnName("NOTE")
                    .HasMaxLength(2000);

                b.Property<int?>("OfficeNumber")
                    .HasColumnName("OFFICE_NUMBER");

                b.Property<string>("OrgReference")
                    .HasColumnName("ORG_REFERENCE")
                    .HasMaxLength(2000);

                b.Property<string>("PasswordHash")
                    .HasColumnName("PASSWORD_HASH")
                    .HasMaxLength(2000);

                b.Property<string>("PhoneNumber")
                    .HasColumnName("PHONE_NUMBER")
                    .HasMaxLength(100);

                b.Property<bool>("PhoneNumberConfirmed")
                    .HasColumnName("PHONE_NUMBER_CONFIRMED");

                b.Property<string>("Picture")
                    .HasColumnName("PICTURE")
                    .HasMaxLength(256);

                b.Property<string>("Reason")
                    .HasColumnName("REASON")
                    .HasMaxLength(2000);

                b.Property<string>("SecurityStamp")
                    .HasColumnName("SECURITY_STAMP")
                    .HasMaxLength(50);

                b.Property<bool>("TwoFactorEnabled")
                    .HasColumnName("TWO_FACTOR_ENABLED");

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.Property<string>("UserName")
                    .IsRequired()
                    .HasColumnName("USER_NAME")
                    .HasMaxLength(256);

                b.Property<short>("UserType")
                    .HasColumnName("USER_TYPE");

                b.HasKey("Id")
                    .HasName("PK_ASP_NET_USERS");

                b.HasIndex("BranchId")
                    .HasName("IX_ASP_NET_USERS_BRANCH_ID");

                b.HasIndex("NormalizedEmail")
                    .HasName("EMAIL_INDEX");

                b.HasIndex("NormalizedUserName")
                    .IsUnique()
                    .HasName("USER_NAME_INDEX");

                b.ToTable("ASP_NET_USERS");
            });

            modelBuilder.Entity("ESEIM.Models.AdAccessLog", b =>
            {
                b.Property<int>("AccessLogId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ACCESS_LOG_ID");

                b.Property<DateTime?>("AccessDate")
                    .HasColumnName("ACCESS_DATE");

                b.Property<string>("AccessLogApplication")
                    .HasColumnName("ACCESS_LOG_APPLICATION")
                    .HasMaxLength(255);

                b.Property<string>("AccessLogCode")
                    .HasColumnName("ACCESS_LOG_CODE")
                    .HasMaxLength(255);

                b.Property<string>("Action")
                    .HasColumnName("ACTION")
                    .HasMaxLength(50);

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(450);

                b.Property<string>("IpAddress")
                    .HasColumnName("IP_ADDRESS")
                    .HasMaxLength(50);

                b.Property<string>("UserId")
                    .HasColumnName("USER_ID")
                    .HasMaxLength(250);

                b.HasKey("AccessLogId")
                    .HasName("PK_VIB_ACCESS_LOG");

                b.ToTable("VIB_ACCESS_LOG");
            });

            modelBuilder.Entity("ESEIM.Models.AdActionLog", b =>
            {
                b.Property<int>("ActionLogId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ACTION_LOG_ID");

                b.Property<string>("ActionLogApplication")
                    .HasColumnName("ACTION_LOG_APPLICATION")
                    .HasMaxLength(500);

                b.Property<string>("ActionLogHost")
                    .HasColumnName("ACTION_LOG_HOST")
                    .HasMaxLength(100);

                b.Property<string>("ActionLogPath")
                    .HasColumnName("ACTION_LOG_PATH")
                    .HasMaxLength(300);

                b.Property<string>("Browser")
                    .HasColumnName("BROWSER")
                    .HasMaxLength(300);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(255);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("DataNew")
                    .HasColumnName("DATA_NEW");

                b.Property<string>("DataOld")
                    .HasColumnName("DATA_OLD");

                b.Property<string>("IpAddress")
                    .HasColumnName("IP_ADDRESS")
                    .HasMaxLength(20);

                b.Property<string>("LogLevel")
                    .HasColumnName("LOG_LEVEL")
                    .HasMaxLength(50);

                b.Property<string>("Message")
                    .HasColumnName("MESSAGE")
                    .HasMaxLength(2000);

                b.Property<string>("ResourceName")
                    .HasColumnName("RESOURCE_NAME")
                    .HasMaxLength(255);

                b.Property<string>("TableModified")
                    .HasColumnName("TABLE_MODIFIED")
                    .HasMaxLength(255);

                b.HasKey("ActionLogId")
                    .HasName("PK_VIB_ACTION_LOG");

                b.HasIndex("CreatedDate")
                    .HasName("IX_VIB_ACTION_LOG_CREATED_DATE");

                b.ToTable("VIB_ACTION_LOG");
            });

            modelBuilder.Entity("ESEIM.Models.AdActionLogHist", b =>
            {
                b.Property<int>("ActionLogId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ACTION_LOG_ID");

                b.Property<string>("ActionLogApplication")
                    .HasColumnName("ACTION_LOG_APPLICATION")
                    .HasMaxLength(500);

                b.Property<string>("ActionLogHost")
                    .HasColumnName("ACTION_LOG_HOST")
                    .HasMaxLength(100);

                b.Property<string>("ActionLogPath")
                    .HasColumnName("ACTION_LOG_PATH")
                    .HasMaxLength(300);

                b.Property<string>("Browser")
                    .HasColumnName("BROWSER")
                    .HasMaxLength(300);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(255);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("DataNew")
                    .HasColumnName("DATA_NEW");

                b.Property<string>("DataOld")
                    .HasColumnName("DATA_OLD");

                b.Property<string>("IpAddress")
                    .HasColumnName("IP_ADDRESS")
                    .HasMaxLength(20);

                b.Property<string>("LogLevel")
                    .HasColumnName("LOG_LEVEL")
                    .HasMaxLength(50);

                b.Property<string>("Message")
                    .HasColumnName("MESSAGE")
                    .HasMaxLength(2000);

                b.Property<string>("ResourceName")
                    .HasColumnName("RESOURCE_NAME")
                    .HasMaxLength(255);

                b.Property<string>("TableModified")
                    .HasColumnName("TABLE_MODIFIED")
                    .HasMaxLength(255);

                b.HasKey("ActionLogId")
                    .HasName("PK_VIB_ACTION_LOG_HIST");

                b.HasIndex("CreatedDate")
                    .HasName("IX_VIB_ACTION_LOG_HIST_CREATED");

                b.ToTable("VIB_ACTION_LOG_HIST");
            });

            modelBuilder.Entity("ESEIM.Models.AdAppFunction", b =>
            {
                b.Property<int>("AppFunctionId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("APP_FUNCTION_ID");

                b.Property<string>("ApplicationCode")
                    .HasColumnName("APPLICATION_CODE")
                    .HasMaxLength(50);

                b.Property<string>("FunctionCode")
                    .HasColumnName("FUNCTION_CODE")
                    .HasMaxLength(50);

                b.HasKey("AppFunctionId")
                    .HasName("PK_VIB_APP_FUNCTION");

                b.HasIndex("ApplicationCode")
                    .HasName("IX_VIB_APP_FUNCTION_APPLICATION_CODE");

                b.HasIndex("FunctionCode")
                    .HasName("IX_VIB_APP_FUNCTION_FUNCTION_CODE");

                b.ToTable("VIB_APP_FUNCTION");
            });

            modelBuilder.Entity("ESEIM.Models.AdApplication", b =>
            {
                b.Property<string>("ApplicationCode")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("APPLICATION_CODE")
                    .HasMaxLength(50);

                b.Property<string>("AppUrl")
                    .HasColumnName("APP_URL")
                    .HasMaxLength(300);

                b.Property<int>("ApplicationId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("APPLICATION_ID");

                b.Property<string>("AuthenticationScheme")
                    .HasColumnName("AUTHENTICATION_SCHEME")
                    .HasMaxLength(255);

                b.Property<string>("Authority")
                    .HasColumnName("AUTHORITY")
                    .HasMaxLength(255);

                b.Property<string>("ClientId")
                    .HasColumnName("CLIENT_ID")
                    .HasMaxLength(255);

                b.Property<string>("ClientSecret")
                    .HasColumnName("CLIENT_SECRET")
                    .HasMaxLength(255);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(500);

                b.Property<string>("Icon")
                    .HasColumnName("ICON")
                    .HasMaxLength(300);

                b.Property<string>("NameClaimType")
                    .HasColumnName("NAME_CLAIM_TYPE")
                    .HasMaxLength(255);

                b.Property<int?>("Ord")
                    .HasColumnName("ORD");

                b.Property<bool?>("RequireHttps")
                    .HasColumnName("REQUIRE_HTTPS");

                b.Property<string>("ResponseType")
                    .HasColumnName("RESPONSE_TYPE")
                    .HasMaxLength(255);

                b.Property<string>("RoleClaimType")
                    .HasColumnName("ROLE_CLAIM_TYPE")
                    .HasMaxLength(255);

                b.Property<string>("Scope")
                    .HasColumnName("SCOPE")
                    .HasMaxLength(255);

                b.Property<int>("Status")
                    .HasColumnName("STATUS");

                b.Property<string>("Title")
                    .HasColumnName("TITLE")
                    .HasMaxLength(255);

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.HasKey("ApplicationCode")
                    .HasName("PK_VIB_APPLICATION");

                b.ToTable("VIB_APPLICATION");
            });

            modelBuilder.Entity("ESEIM.Models.AdDivision", b =>
            {
                b.Property<string>("Division")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("DIVISION")
                    .HasMaxLength(255);

                b.Property<string>("DivisionDesc")
                    .HasColumnName("DIVISION_DESC")
                    .HasMaxLength(255);

                b.Property<string>("UpdateTime")
                    .HasColumnName("UPDATE_TIME")
                    .HasMaxLength(50);

                b.HasKey("Division")
                    .HasName("PK_VIB_DIVISION");

                b.ToTable("VIB_DIVISION");
            });

            modelBuilder.Entity("ESEIM.Models.AdJobLog", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID");

                b.Property<string>("ErrorDesc")
                    .HasColumnName("ERROR_DESC")
                    .HasMaxLength(2000);

                b.Property<string>("FunctionCode")
                    .IsRequired()
                    .HasColumnName("FUNCTION_CODE")
                    .HasMaxLength(100);

                b.Property<string>("PackageName")
                    .HasColumnName("PACKAGE_NAME")
                    .HasMaxLength(100);

                b.Property<string>("ProcedureName")
                    .HasColumnName("PROCEDURE_NAME")
                    .HasMaxLength(100);

                b.Property<DateTime>("RunTime")
                    .HasColumnName("RUN_TIME")
                    .HasMaxLength(255);

                b.Property<string>("Status")
                    .HasColumnName("STATUS")
                    .HasMaxLength(3);

                b.Property<DateTime>("SymRunDate")
                    .HasColumnName("SYM_RUN_DATE");

                b.Property<string>("TableName")
                    .HasColumnName("TABLE_NAME")
                    .HasMaxLength(100);

                b.Property<int>("TotalRecord")
                    .HasColumnName("TOTAL_RECORD");

                b.HasKey("Id")
                    .HasName("PK_VIB_JOB_LOG");

                b.ToTable("VIB_JOB_LOG");
            });

            modelBuilder.Entity("ESEIM.Models.AdFmAcctExec", b =>
            {
                b.Property<string>("AcctExec")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ACCT_EXEC")
                    .HasMaxLength(3);

                b.Property<string>("AcctExecName")
                    .HasColumnName("ACCT_EXEC_NAME")
                    .HasMaxLength(50);

                b.Property<string>("CollatMgrInd")
                    .HasColumnName("COLLAT_MGR_IND")
                    .HasMaxLength(1);

                b.Property<DateTime?>("CreateDate")
                    .HasColumnName("CREATE_DATE");

                b.Property<string>("Manager")
                    .HasColumnName("MANAGER")
                    .HasMaxLength(3);

                b.Property<string>("ProfitSegment")
                    .HasColumnName("PROFIT_SEGMENT")
                    .HasMaxLength(12);

                b.Property<string>("StaffCode")
                    .HasColumnName("STAFF_CODE")
                    .HasMaxLength(6);

                b.HasKey("AcctExec")
                    .HasName("PK_VIB_FM_ACCT_EXEC");

                b.ToTable("VIB_FM_ACCT_EXEC");
            });

            modelBuilder.Entity("ESEIM.Models.AdFunction", b =>
            {
                b.Property<string>("FunctionCode")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("FUNCTION_CODE")
                    .HasMaxLength(50);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(500);

                b.Property<int>("FunctionId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("FUNCTION_ID");

                b.Property<int?>("Ord")
                    .HasColumnName("ORD");

                b.Property<string>("ParentCode")
                    .HasColumnName("PARENT_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Title")
                    .HasColumnName("TITLE")
                    .HasMaxLength(255);

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.HasKey("FunctionCode")
                    .HasName("PK_VIB_FUNCTION");

                b.HasIndex("ParentCode")
                    .HasName("IX_VIB_FUNCTION_PARENT_CODE");

                b.ToTable("VIB_FUNCTION");
            });

            modelBuilder.Entity("ESEIM.Models.AdGroupUser", b =>
            {
                b.Property<string>("GroupUserCode")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("GROUP_USER_CODE")
                    .HasMaxLength(50);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(500);

                b.Property<int>("GroupUserId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("GROUP_USER_ID");

                b.Property<string>("ParentCode")
                    .HasColumnName("PARENT_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Title")
                    .HasColumnName("TITLE")
                    .HasMaxLength(255);

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.HasKey("GroupUserCode")
                    .HasName("PK_VIB_GROUP_USER");

                b.HasIndex("ParentCode")
                    .HasName("IX_VIB_GROUP_USER_PARENT_CODE");

                b.ToTable("VIB_GROUP_USER");
            });

            modelBuilder.Entity("ESEIM.Models.AdLanguage", b =>
            {
                b.Property<int>("LanguageId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("LANGUAGE_ID");

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Culture")
                    .HasColumnName("CULTURE")
                    .HasMaxLength(10);

                b.Property<string>("DeletedBy")
                    .HasColumnName("DELETED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("DeletedDate")
                    .HasColumnName("DELETED_DATE");

                b.Property<string>("DisplayName")
                    .HasColumnName("DISPLAY_NAME")
                    .HasMaxLength(256);

                b.Property<string>("Icon")
                    .HasColumnName("ICON")
                    .HasMaxLength(128);

                b.Property<bool?>("IsDefault")
                    .HasColumnName("IS_DEFAULT");

                b.Property<bool>("IsDeleted")
                    .HasColumnName("IS_DELETED");

                b.Property<bool>("IsEnabled")
                    .HasColumnName("IS_ENABLED");

                b.Property<int>("Ordering")
                    .HasColumnName("ORDERING");

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.HasKey("LanguageId")
                    .HasName("PK_VIB_LANGUAGE");

                b.ToTable("VIB_LANGUAGE");
            });

            modelBuilder.Entity("ESEIM.Models.AdLanguageText", b =>
            {
                b.Property<int>("LanguageTextId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("LANGUAGE_TEXT_ID");

                b.Property<string>("Caption")
                    .HasColumnName("CAPTION")
                    .HasMaxLength(500);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("DeletedBy")
                    .HasColumnName("DELETED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("DeletedDate")
                    .HasColumnName("DELETED_DATE");

                b.Property<string>("GroupCaption")
                    .HasColumnName("GROUP_CAPTION")
                    .HasMaxLength(20);

                b.Property<bool>("IsDeleted")
                    .HasColumnName("IS_DELETED");

                b.Property<int>("LanguageId")
                    .HasColumnName("LANGUAGE_ID");

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.Property<string>("Value")
                    .HasColumnName("VALUE");

                b.HasKey("LanguageTextId")
                    .HasName("PK_VIB_LANGUAGE_TEXT");

                b.HasIndex("LanguageId")
                    .HasName("IX_VIB_LANGUAGE_TEXT_LANGUAGE_ID");

                b.ToTable("VIB_LANGUAGE_TEXT");
            });

            modelBuilder.Entity("ESEIM.Models.AdOrganization", b =>
            {
                b.Property<string>("OrgAddonCode")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ORG_ADDON_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Company")
                    .HasColumnName("COMPANY")
                    .HasMaxLength(255);

                b.Property<string>("Country")
                    .HasColumnName("COUNTRY")
                    .HasMaxLength(255);

                b.Property<string>("Division")
                    .HasColumnName("DIVISION")
                    .HasMaxLength(255);

                b.Property<string>("HierarchyCode")
                    .HasColumnName("HIERARCHY_CODE")
                    .HasMaxLength(255);

                b.Property<string>("OrgCode")
                    .HasColumnName("ORG_CODE")
                    .HasMaxLength(50);

                b.Property<int?>("OrgGroup")
                    .HasColumnName("ORG_GROUP");

                b.Property<int>("OrgId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ORG_ID");

                b.Property<string>("OrgName")
                    .HasColumnName("ORG_NAME")
                    .HasMaxLength(500);

                b.Property<int?>("OrgOrd")
                    .HasColumnName("ORG_ORD");

                b.Property<string>("OrgParentCode")
                    .HasColumnName("ORG_PARENT_CODE")
                    .HasMaxLength(50);

                b.Property<string>("OrgUpdateTime")
                    .HasColumnName("ORG_UPDATE_TIME")
                    .HasMaxLength(50);

                b.Property<string>("State")
                    .HasColumnName("STATE")
                    .HasMaxLength(255);

                b.HasKey("OrgAddonCode")
                    .HasName("PK_VIB_ORGANIZATION");

                b.HasIndex("OrgParentCode")
                    .HasName("IX_VIB_ORGANIZATION_ORG_PARENT_CODE");

                b.ToTable("VIB_ORGANIZATION");
            });

            modelBuilder.Entity("ESEIM.Models.AdParameter", b =>
            {
                b.Property<string>("ParameterCode")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("PARAMETER_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(500);

                b.Property<int>("ParameterId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("PARAMETER_ID");

                b.Property<string>("ParentCode")
                    .HasColumnName("PARENT_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Title")
                    .HasColumnName("TITLE")
                    .HasMaxLength(255);

                b.Property<string>("Value")
                    .HasColumnName("VALUE")
                    .HasMaxLength(50);

                b.Property<string>("Value2")
                    .HasColumnName("VALUE2")
                    .HasMaxLength(50);

                b.Property<string>("Value3")
                    .HasColumnName("VALUE3")
                    .HasMaxLength(50);

                b.Property<string>("Value4")
                    .HasColumnName("VALUE4")
                    .HasMaxLength(50);

                b.Property<string>("Value5")
                    .HasColumnName("VALUE5")
                    .HasMaxLength(50);

                b.HasKey("ParameterCode")
                    .HasName("PK_VIB_PARAMETER");

                b.HasIndex("ParentCode")
                    .HasName("IX_VIB_PARAMETER_PARENT_CODE");

                b.ToTable("VIB_PARAMETER");
            });

            modelBuilder.Entity("ESEIM.Models.AdPermission", b =>
            {
                b.Property<int>("PermissionId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("PERMISSION_ID");

                b.Property<string>("ApplicationCode")
                    .HasColumnName("APPLICATION_CODE")
                    .HasMaxLength(50);

                b.Property<DateTime?>("ExpiredDate")
                    .HasColumnName("EXPIRED_DATE");

                b.Property<string>("FunctionCode")
                    .HasColumnName("FUNCTION_CODE")
                    .HasMaxLength(50);

                b.Property<string>("GroupUserCode")
                    .HasColumnName("GROUP_USER_CODE")
                    .HasMaxLength(50);

                b.Property<string>("ResourceCode")
                    .HasColumnName("RESOURCE_CODE")
                    .HasMaxLength(50);

                b.Property<string>("RoleId")
                    .HasColumnName("ROLE_ID")
                    .HasMaxLength(50);

                b.Property<string>("UserId")
                    .HasColumnName("USER_ID")
                    .HasMaxLength(50);

                b.HasKey("PermissionId")
                    .HasName("PK_VIB_PERMISSION");

                b.HasIndex("ApplicationCode")
                    .HasName("IX_VIB_PERMISSION_APPLICATION_CODE");

                b.HasIndex("FunctionCode")
                    .HasName("IX_VIB_PERMISSION_FUNCTION_CODE");

                b.HasIndex("GroupUserCode")
                    .HasName("IX_VIB_PERMISSION_GROUP_USER_CODE");

                b.HasIndex("ResourceCode")
                    .HasName("IX_VIB_PERMISSION_RESOURCE_CODE");

                b.HasIndex("RoleId")
                    .HasName("IX_VIB_PERMISSION_ROLE_ID");

                b.HasIndex("UserId")
                    .HasName("IX_VIB_PERMISSION_USER_ID");

                b.ToTable("VIB_PERMISSION");
            });

            modelBuilder.Entity("ESEIM.Models.AdPrivilege", b =>
            {
                b.Property<int>("PrivilegeId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("PRIVILEGE_ID");

                b.Property<string>("FunctionCode")
                    .HasColumnName("FUNCTION_CODE")
                    .HasMaxLength(50);

                b.Property<string>("ResourceCode")
                    .HasColumnName("RESOURCE_CODE")
                    .HasMaxLength(50);

                b.HasKey("PrivilegeId")
                    .HasName("PK_VIB_PRIVILEGE");

                b.HasIndex("FunctionCode")
                    .HasName("IX_VIB_PRIVILEGE_FUNCTION_CODE");

                b.HasIndex("ResourceCode")
                    .HasName("IX_VIB_PRIVILEGE_RESOURCE_CODE");

                b.ToTable("VIB_PRIVILEGE");
            });

            modelBuilder.Entity("ESEIM.Models.AdResource", b =>
            {
                b.Property<string>("ResourceCode")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("RESOURCE_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Api")
                    .HasColumnName("API")
                    .HasMaxLength(255);

                b.Property<string>("CreatedBy")
                    .HasColumnName("CREATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnName("CREATED_DATE");

                b.Property<string>("Description")
                    .HasColumnName("DESCRIPTION")
                    .HasMaxLength(2000);

                b.Property<int?>("Ord")
                    .HasColumnName("ORD");

                b.Property<string>("ParentCode")
                    .HasColumnName("PARENT_CODE")
                    .HasMaxLength(50);

                b.Property<string>("Path")
                    .HasColumnName("PATH")
                    .HasMaxLength(255);

                b.Property<int>("ResourceId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("RESOURCE_ID");

                b.Property<bool>("Scope")
                    .HasColumnName("SCOPE");

                b.Property<bool>("Status")
                    .HasColumnName("STATUS");

                b.Property<string>("Style")
                    .HasColumnName("STYLE")
                    .HasMaxLength(10);

                b.Property<string>("Title")
                    .HasColumnName("TITLE")
                    .HasMaxLength(255);

                b.Property<string>("UpdatedBy")
                    .HasColumnName("UPDATED_BY")
                    .HasMaxLength(50);

                b.Property<DateTime?>("UpdatedDate")
                    .HasColumnName("UPDATED_DATE");

                b.HasKey("ResourceCode")
                    .HasName("PK_VIB_RESOURCE");

                b.HasIndex("ParentCode")
                    .HasName("IX_VIB_RESOURCE_PARENT_CODE");

                b.ToTable("VIB_RESOURCE");
            });

            modelBuilder.Entity("ESEIM.Models.AdUserInGroup", b =>
            {
                b.Property<int>("UserInGroupId")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("USER_IN_GROUP_ID");

                b.Property<string>("ApplicationCode")
                    .HasColumnName("APPLICATION_CODE")
                    .HasMaxLength(50);

                b.Property<string>("BranchReference")
                    .HasColumnName("BRANCH_REFERENCE")
                    .HasMaxLength(2000);

                b.Property<bool>("GrantAll")
                    .HasColumnName("GRANT_ALL");

                b.Property<string>("GroupUserCode")
                    .HasColumnName("GROUP_USER_CODE")
                    .HasMaxLength(50);

                b.Property<bool>("IsMain")
                    .HasColumnName("IS_MAIN");

                b.Property<string>("RoleId")
                    .HasColumnName("ROLE_ID")
                    .HasMaxLength(50);

                b.Property<string>("UserId")
                    .HasColumnName("USER_ID")
                    .HasMaxLength(50);

                b.HasKey("UserInGroupId")
                    .HasName("PK_VIB_USER_IN_GROUP");

                b.HasIndex("ApplicationCode")
                    .HasName("IX_VIB_USER_IN_GROUP_APPLICATION_CODE");

                b.HasIndex("GroupUserCode")
                    .HasName("IX_VIB_USER_IN_GROUP_GROUP_USER_CODE");

                b.HasIndex("RoleId")
                    .HasName("IX_VIB_USER_IN_GROUP_ROLE_ID");

                b.HasIndex("UserId")
                    .HasName("IX_VIB_USER_IN_GROUP_USER_ID");

                b.ToTable("VIB_USER_IN_GROUP");
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<string>", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID");

                b.Property<string>("ClaimType")
                    .HasColumnName("CLAIM_TYPE");

                b.Property<string>("ClaimValue")
                    .HasColumnName("CLAIM_VALUE");

                b.Property<string>("RoleId")
                    .IsRequired()
                    .HasColumnName("ROLE_ID");

                b.HasKey("Id")
                    .HasName("PK_ASP_NET_ROLE_CLAIMS");

                b.HasIndex("RoleId")
                    .HasName("IX_ASP_NET_ROLE_CLAIMS_ROLE_ID");

                b.ToTable("ASP_NET_ROLE_CLAIMS");
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<string>", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnName("ID");

                b.Property<string>("ClaimType")
                    .HasColumnName("CLAIM_TYPE");

                b.Property<string>("ClaimValue")
                    .HasColumnName("CLAIM_VALUE");

                b.Property<string>("UserId")
                    .IsRequired()
                    .HasColumnName("USER_ID");

                b.HasKey("Id")
                    .HasName("PK_ASP_NET_USER_CLAIMS");

                b.HasIndex("UserId")
                    .HasName("IX_ASP_NET_USER_CLAIMS_USER_ID");

                b.ToTable("ASP_NET_USER_CLAIMS");
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<string>", b =>
            {
                b.Property<string>("LoginProvider")
                    .HasColumnName("LOGIN_PROVIDER");

                b.Property<string>("ProviderKey")
                    .HasColumnName("PROVIDER_KEY");

                b.Property<string>("ProviderDisplayName")
                    .HasColumnName("PROVIDER_DISPLAY_NAME");

                b.Property<string>("UserId")
                    .IsRequired()
                    .HasColumnName("USER_ID");

                b.HasKey("LoginProvider", "ProviderKey")
                    .HasName("PK_ASP_NET_USER_LOGINS");

                b.HasIndex("UserId")
                    .HasName("IX_ASP_NET_USER_LOGINS_USER_ID");

                b.ToTable("ASP_NET_USER_LOGINS");
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<string>", b =>
            {
                b.Property<string>("UserId")
                    .HasColumnName("USER_ID");

                b.Property<string>("RoleId")
                    .HasColumnName("ROLE_ID");

                b.HasKey("UserId", "RoleId")
                    .HasName("PK_ASP_NET_USER_ROLES");

                b.HasIndex("RoleId")
                    .HasName("IX_ASP_NET_USER_ROLES_ROLE_ID");

                b.ToTable("ASP_NET_USER_ROLES");
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserToken<string>", b =>
            {
                b.Property<string>("UserId")
                    .HasColumnName("USER_ID");

                b.Property<string>("LoginProvider")
                    .HasColumnName("LOGIN_PROVIDER");

                b.Property<string>("Name")
                    .HasColumnName("NAME");

                b.Property<string>("Value")
                    .HasColumnName("VALUE");

                b.HasKey("UserId", "LoginProvider", "Name")
                    .HasName("PK_ASP_NET_USER_TOKENS");

                b.ToTable("ASP_NET_USER_TOKENS");
            });

            modelBuilder.Entity("ESEIM.Models.AspNetUser", b =>
            {
                b.HasOne("ESEIM.Models.AdOrganization", "Branch")
                    .WithMany("BranchUsers")
                    .HasForeignKey("BranchId")
                    .HasConstraintName("FK_ASP_NET_USERS_VIB_ORGANIZATION_BRANCH_ID");
            });

            modelBuilder.Entity("ESEIM.Models.AdAppFunction", b =>
            {
                b.HasOne("ESEIM.Models.AdApplication", "Application")
                    .WithMany("AppFunctions")
                    .HasForeignKey("ApplicationCode")
                    .HasConstraintName("FK_VIB_APP_FUNCTION_VIB_APPLICATION_APPLICATION_CODE");

                b.HasOne("ESEIM.Models.AdFunction", "Function")
                    .WithMany("AppFunctions")
                    .HasForeignKey("FunctionCode")
                    .HasConstraintName("FK_VIB_APP_FUNCTION_VIB_FUNCTION_FUNCTION_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdFunction", b =>
            {
                b.HasOne("ESEIM.Models.AdFunction", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentCode")
                    .HasConstraintName("FK_VIB_FUNCTION_VIB_FUNCTION_PARENT_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdGroupUser", b =>
            {
                b.HasOne("ESEIM.Models.AdGroupUser", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentCode")
                    .HasConstraintName("FK_VIB_GROUP_USER_VIB_GROUP_USER_PARENT_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdLanguageText", b =>
            {
                b.HasOne("ESEIM.Models.AdLanguage", "Language")
                    .WithMany("LanguageTexts")
                    .HasForeignKey("LanguageId")
                    .HasConstraintName("FK_VIB_LANGUAGE_TEXT_VIB_LANGUAGE_LANGUAGE_ID")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("ESEIM.Models.AdOrganization", b =>
            {
                b.HasOne("ESEIM.Models.AdOrganization", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("OrgParentCode")
                    .HasConstraintName("FK_VIB_ORGANIZATION_VIB_ORGANIZATION_ORG_PARENT_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdParameter", b =>
            {
                b.HasOne("ESEIM.Models.AdParameter", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentCode")
                    .HasConstraintName("FK_VIB_PARAMETER_VIB_PARAMETER_PARENT_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdPermission", b =>
            {
                b.HasOne("ESEIM.Models.AdApplication", "Application")
                    .WithMany("Permissions")
                    .HasForeignKey("ApplicationCode")
                    .HasConstraintName("FK_VIB_PERMISSION_VIB_APPLICATION_APPLICATION_CODE");

                b.HasOne("ESEIM.Models.AdFunction", "Function")
                    .WithMany("Permissions")
                    .HasForeignKey("FunctionCode")
                    .HasConstraintName("FK_VIB_PERMISSION_VIB_FUNCTION_FUNCTION_CODE");

                b.HasOne("ESEIM.Models.AdGroupUser", "GroupUser")
                    .WithMany("VIBPermissions")
                    .HasForeignKey("GroupUserCode")
                    .HasConstraintName("FK_VIB_PERMISSION_VIB_GROUP_USER_GROUP_USER_CODE");

                b.HasOne("ESEIM.Models.AdResource", "Resource")
                    .WithMany("Permissions")
                    .HasForeignKey("ResourceCode")
                    .HasConstraintName("FK_VIB_PERMISSION_VIB_RESOURCE_RESOURCE_CODE");

                b.HasOne("ESEIM.Models.AspNetRole", "Role")
                    .WithMany("VIBPermissions")
                    .HasForeignKey("RoleId")
                    .HasConstraintName("FK_VIB_PERMISSION_ASP_NET_ROLES_ROLE_ID");

                b.HasOne("ESEIM.Models.AspNetUser", "User")
                    .WithMany("VIBPermissions")
                    .HasForeignKey("UserId")
                    .HasConstraintName("FK_VIB_PERMISSION_ASP_NET_USERS_USER_ID");
            });

            modelBuilder.Entity("ESEIM.Models.AdPrivilege", b =>
            {
                b.HasOne("ESEIM.Models.AdFunction", "Function")
                    .WithMany("Privileges")
                    .HasForeignKey("FunctionCode")
                    .HasConstraintName("FK_VIB_PRIVILEGE_VIB_FUNCTION_FUNCTION_CODE");

                b.HasOne("ESEIM.Models.AdResource", "Resource")
                    .WithMany("Privileges")
                    .HasForeignKey("ResourceCode")
                    .HasConstraintName("FK_VIB_PRIVILEGE_VIB_RESOURCE_RESOURCE_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdResource", b =>
            {
                b.HasOne("ESEIM.Models.AdResource", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentCode")
                    .HasConstraintName("FK_VIB_RESOURCE_VIB_RESOURCE_PARENT_CODE");
            });

            modelBuilder.Entity("ESEIM.Models.AdUserInGroup", b =>
            {
                b.HasOne("ESEIM.Models.AdApplication", "Application")
                    .WithMany("UserInGroups")
                    .HasForeignKey("ApplicationCode")
                    .HasConstraintName("FK_VIB_USER_IN_GROUP_VIB_APPLICATION_APPLICATION_CODE");

                b.HasOne("ESEIM.Models.AdGroupUser", "GroupUser")
                    .WithMany("VIBUserInGroups")
                    .HasForeignKey("GroupUserCode")
                    .HasConstraintName("FK_VIB_USER_IN_GROUP_VIB_GROUP_USER_GROUP_USER_CODE");

                b.HasOne("ESEIM.Models.AspNetRole", "Role")
                    .WithMany("VIBUserInGroups")
                    .HasForeignKey("RoleId")
                    .HasConstraintName("FK_VIB_USER_IN_GROUP_ASP_NET_ROLES_ROLE_ID");

                b.HasOne("ESEIM.Models.AspNetUser", "User")
                    .WithMany("VIBUserInGroups")
                    .HasForeignKey("UserId")
                    .HasConstraintName("FK_VIB_USER_IN_GROUP_ASP_NET_USERS_USER_ID");
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<string>", b =>
            {
                b.HasOne("ESEIM.Models.AspNetRole")
                    .WithMany("Claims")
                    .HasForeignKey("RoleId")
                    .HasConstraintName("FK_ASP_NET_ROLE_CLAIMS_ASP_NET_ROLES_ROLE_ID")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<string>", b =>
            {
                b.HasOne("ESEIM.Models.AspNetUser")
                    .WithMany("Claims")
                    .HasForeignKey("UserId")
                    .HasConstraintName("FK_ASP_NET_USER_CLAIMS_ASP_NET_USERS_USER_ID")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<string>", b =>
            {
                b.HasOne("ESEIM.Models.AspNetUser")
                    .WithMany("Logins")
                    .HasForeignKey("UserId")
                    .HasConstraintName("FK_ASP_NET_USER_LOGINS_ASP_NET_USERS_USER_ID")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<string>", b =>
            {
                b.HasOne("ESEIM.Models.AspNetRole")
                    .WithMany("Users")
                    .HasForeignKey("RoleId")
                    .HasConstraintName("FK_ASP_NET_USER_ROLES_ASP_NET_ROLES_ROLE_ID")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("ESEIM.Models.AspNetUser")
                    .WithMany("Roles")
                    .HasForeignKey("UserId")
                    .HasConstraintName("FK_ASP_NET_USER_ROLES_ASP_NET_USERS_USER_ID")
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
