using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using III.Domain.Common;

namespace ESEIM.Models
{
    public partial class VCContext : IdentityDbContext<AspNetUser, AspNetRole, string>
    {
        public VCContext(DbContextOptions<VCContext> options) : base(options)
        {
        }
        //public virtual DbSet<AdAccessLog> AdAccessLogs { get; set; }
        //public virtual DbSet<AdActionLog> AdActionLogs { get; set; }
        //public virtual DbSet<AdAppFunction> AdAppFunctions { get; set; }
        //public virtual DbSet<AdApplication> AdApplications { get; set; }
        //public virtual DbSet<AdFunction> AdFunctions { get; set; }
        //public virtual DbSet<AdGroupUser> AdGroupUsers { get; set; }
        //public virtual DbSet<AdLanguage> AdLanguages { get; set; }
        //public virtual DbSet<AdLanguageText> AdLanguageTexts { get; set; }
        //public virtual DbSet<AdOrganization> AdOrganizations { get; set; }
        //public virtual DbSet<AdParameter> AdParameters { get; set; }
        //public virtual DbSet<AdPermission> AdPermissions { get; set; }
        //public virtual DbSet<AdPrivilege> AdPrivileges { get; set; }
        //public virtual DbSet<AdResource> AdResources { get; set; }
        //public virtual DbSet<AdUserInGroup> AdUserInGroups { get; set; }
        public virtual DbSet<VcCurrentPosition> Remooc_current_positions { get; set; }
        public virtual DbSet<VcExtrafield> RemoocExtrafields { get; set; }
        public virtual DbSet<VcPacking> RemoocPackings { get; set; }
        //public virtual DbSet<Remooc_vendor> Remooc_vendor { get; set; }
        public virtual DbSet<VcRemooc> RemooRemoocs { get; set; }
        public virtual DbSet<VcTracking> RemoocTrackings { get; set; }
        public virtual DbSet<VcTractor> Remooc_tractors { get; set; }
        public virtual DbSet<VcFcm> Remooc_Fcm_Tokens { get; set; }
        public virtual DbSet<VcDriver> Romooc_Driver { get; set; }
        public virtual DbSet<VcFcmMessage> VcFcmMessages { get; set; }
        public virtual DbSet<VcCommandOrderTruck> command_order_truck { get; set; }
        //public virtual DbSet<E_AppointmentTeaching> E_AppointmentTeachings { get; set; }
        //public virtual DbSet<E_Class_Teacher> E_Class_Teachers { get; set; }
        //public virtual DbSet<E_Class> E_Classs { get; set; }
        public virtual DbSet<VcCompany> E_Companys { get; set; }
        public virtual DbSet<VcExtend> E_Extends { get; set; }
        //public virtual DbSet<Eoffice_Customer> Eoffice_Customers { get; set; }
        //public virtual DbSet<Eoffice_CustomerFile> Eoffice_CustomerFiles { get; set; }
        //public virtual DbSet<EofficeCustomField> EofficeCustomFields { get; set; }
        //public virtual DbSet<EofficeContactFile> EofficeContactFiles { get; set; }
        //public virtual DbSet<EofficeContact> EofficeContacts { get; set; }
        //public virtual DbSet<EofficeOrderCustomer> EofficeOrderCustomers { get; set; }
        //public virtual DbSet<AdDivision> AdDivision { get; set; }
        //public virtual DbSet<Maintain_book_checking> Maintain_book_checkings { get; set; }
        //public virtual DbSet<Maintain_book_material_details> Maintain_book_material_detailss { get; set; }
        //public virtual DbSet<Maintain_book_service_details> Maintain_book_service_detailss { get; set; }
        //public virtual DbSet<Maintain_cat_services> Maintain_cat_servicess { get; set; }
        //public virtual DbSet<Maintain_extra_options> Maintain_extra_optionss { get; set; }
        //public virtual DbSet<Maintain_file> Maintain_files { get; set; }
        //public virtual DbSet<Maintain_table_cost_details> Maintain_table_cost_detailss { get; set; }
        //public virtual DbSet<Maintain_table_cost_header> Maintain_table_cost_headers { get; set; }
        public virtual DbSet<VcMaintainMaterialDetails> Maintain_material_detailss { get; set; }


        //public virtual DbSet<Jnana_news_cat> Jnana_news_cat { get; set; }
        //public virtual DbSet<Jnana_news_article_file> Jnana_news_article_files { get; set; }
        //public virtual DbSet<Jnana_news_article> Jnana_news_articles { get; set; }
        //public virtual DbSet<Jnana_file> Jnana_file { get; set; }
        //public virtual DbSet<Jnana_ApiGoogle_Services> Jnana_ApiGoogle_Services { get; set; }
        //public virtual DbSet<Jnana_count_request_google> Jnana_count_request_google { get; set; }
        //public virtual DbSet<VcChannel> Jnana_Channels { get; set; }
        //public virtual DbSet<VcBotData> Jnana_Bot_Data { get; set; }
        //public virtual DbSet<Driver_activity_log> Driver_activity_log { get; set; }

        //public virtual DbSet<Setting> Settings { get; set; }



        ////summbit table
        public virtual DbSet<VcHrEmployee> hr_Employee { get; set; }
        //public virtual DbSet<hr_Address> hr_Address { get; set; }
        //public virtual DbSet<hr_allowance> hr_allowances { get; set; }
        //public virtual DbSet<hr_allowance_type> hr_allowance_types { get; set; }
        //public virtual DbSet<hr_clock> hr_clocks { get; set; }
        //public virtual DbSet<hr_config_salary> hr_config_salarys { get; set; }
        //public virtual DbSet<hr_Contact> hr_Contact { get; set; }
        //public virtual DbSet<hr_contract> hr_contracts { get; set; }
        //public virtual DbSet<hr_Department> hr_Department { get; set; }
        //public virtual DbSet<hr_Education> hr_Education { get; set; }
        //public virtual DbSet<hr_email> hr_emails { get; set; }
        //public virtual DbSet<hr_experience_work> hr_experience_works { get; set; }
        //public virtual DbSet<hr_family> hr_familys { get; set; }
        //public virtual DbSet<hr_file> hr_files { get; set; }
        //public virtual DbSet<hr_holiday> hr_holidays { get; set; }
        //public virtual DbSet<hr_insuarance> hr_insuarances { get; set; }
        //public virtual DbSet<hr_reward> hr_rewards { get; set; }
        //public virtual DbSet<hr_salary> hr_salarys { get; set; }
        //public virtual DbSet<hr_salary_base> hr_salary_bases { get; set; }
        //public virtual DbSet<hr_training_course> hr_training_courses { get; set; }
        //public virtual DbSet<hr_unit_work> hr_unit_works { get; set; }
        //public virtual DbSet<hr_workflows> hr_workflowss { get; set; }
        //public virtual DbSet<hr_working_process> hr_working_processs { get; set; }
        //public virtual DbSet<Appointment_Job_Employee> Appointment_Job_Employee { get; set; }

        //// project manager
        //public virtual DbSet<Prj_Appointment> Prj_Appointments { get; set; }
        //public virtual DbSet<Prj_Appointment_File> Prj_Appointment_Files { get; set; }
        //public virtual DbSet<Prj_Appointment_History> Prj_Appointment_Historys { get; set; }
        //public virtual DbSet<Prj_Appointment_Priority> Prj_Appointment_Prioritys { get; set; }
        //public virtual DbSet<prj_appointment_status> prj_appointment_statuss { get; set; }
        //public virtual DbSet<Prj_Appointment_Work_File> Prj_Appointment_Work_Files { get; set; }
        //public virtual DbSet<Prj_Depart> Prj_Departs { get; set; }
        //public virtual DbSet<Prj_Extra_Option> Prj_Extra_Options { get; set; }
        //public virtual DbSet<Prj_File> Prj_Files { get; set; }
        //public virtual DbSet<Prj_Logs> Prj_Logss { get; set; }
        //public virtual DbSet<Prj_MarketingType> Prj_MarketingTypes { get; set; }
        //public virtual DbSet<Prj_Project> Prj_Projects { get; set; }
        //public virtual DbSet<Prj_Project_Appointment> Prj_Project_Appointments { get; set; }
        //public virtual DbSet<Prj_Project_Client> Prj_Project_Clients { get; set; }
        //public virtual DbSet<Prj_Project_Contacts> Prj_Project_Contactss { get; set; }
        //public virtual DbSet<Prj_Project_Departments> Prj_Project_Departmentss { get; set; }
        //public virtual DbSet<Prj_Project_File> Prj_Project_Files { get; set; }
        //public virtual DbSet<Prj_Project_User> Prj_Project_Users { get; set; }
        //public virtual DbSet<Wfn_Component> Wfc_Components { get; set; }
        //public virtual DbSet<Wfn_Component_extend> Wfn_Component_extends { get; set; }
        //public virtual DbSet<Wfn_Dataloger_Parameter> Wfc_Dataloger_Parameters { get; set; }
        //public virtual DbSet<Wfn_Dataloger_Realtime> Wfc_Dataloger_Realtimes { get; set; }
        //public virtual DbSet<Wfn_Dataloger_Store> Wfc_Dataloger_Stores { get; set; }
        //public virtual DbSet<Wfn_Area_Water_Tunnel> Wfn_Area_Water_Tunnels { get; set; }
        //public virtual DbSet<Wfn_Node> Wfn_Nodes { get; set; }
        //public virtual DbSet<Wfn_Link_Node> Wfn_Link_Nodes { get; set; }
        //public virtual DbSet<Wfn_Network_C> Wfn_Network_Cs { get; set; }
        //public virtual DbSet<Wfn_TreeTunel> Wfn_TreeTunels { get; set; }

        //public virtual DbSet<Vayxe_Book_Checking> Vayxe_Book_Checking { get; set; }
        //public virtual DbSet<Vayxe_Cars> Vayxe_Cars { get; set; }
        //public virtual DbSet<Vayxe_Book_Service_Details> Vayxe_Book_Service_Details { get; set; }
        //public virtual DbSet<Vayxe_Cat_Sevices> Vayxe_Cat_Sevices { get; set; }
        //public virtual DbSet<Vayxe_Book_Material_Details> Vayxe_Book_Material_Details { get; set; }
        //public virtual DbSet<Vayxe_Material_Goods> Vayxe_Material_Goods { get; set; }
        //public virtual DbSet<Vayxe_Vendor> Vayxe_Vendors { get; set; }
        //public virtual DbSet<Vayxe_Activity_Request_Status_Delivery> Vayxe_Activity_Request_Status_Delivery { get; set; }
        //public virtual DbSet<Vayxe_Booking> Vayxe_Booking { get; set; }
        //public virtual DbSet<Vayxe_Driver> Vayxe_Driver { get; set; }
        //public virtual DbSet<Vayxe_Table_Cost_Header> Vayxe_Table_Cost_Header { get; set; }
        //public virtual DbSet<Vayxe_Table_Cost_Details> Vayxe_Table_Cost_Details { get; set; }
        //public virtual DbSet<SOSInfo> SOSInfos { get; set; }
        //public virtual DbSet<SOSMedia> SOSMedias { get; set; }
        public virtual DbSet<VcGisTable> VcGisTables { get; set; }
        //public virtual DbSet<VcCommentSetting> CommentSettings { get; set; }
        //public virtual DbSet<Robot> Robots { get; set; }
        public virtual DbSet<VcProductCat> ProductCats { get; set; }
        public virtual DbSet<VcCommontSetting> Common_Settings { get; set; }
        public virtual DbSet<VcWorkCheck> VcWorkChecks { get; set; }
        public virtual DbSet<VcSettingRoute> VcSettingRoutes { get; set; }
        public virtual DbSet<VcWorkPlan> VcWorkPlans { get; set; }
        public virtual DbSet<VcWorkPlanLog> VcWorkPlanLogs { get; set; }
        public virtual DbSet<VcCustomerCare> VcCustomerCares { get; set; }
        public virtual DbSet<VcLeaderApprove> VcLeaderApproves { get; set; }
        public virtual DbSet<VcStoreIdea> VcStoreIdeas { get; set; }
        public virtual DbSet<VcCustomerDeclareInfo> VcCustomerDeclareInfos { get; set; }
        public virtual DbSet<VcCustomerDeclareHeaderInfo> VcCustomerDeclareHeaderInfos { get; set; }
        public virtual DbSet<VcSOSInfo> VcSOSInfos { get; set; }
        public virtual DbSet<VcSOSMedia> VcSOSMedias { get; set; }
        public virtual DbSet<VcAppAccessLog> VcAppAccessLogs { get; set; }

        //Tin Nội bộ
        public virtual DbSet<VCJnanaFile> VCJnanaFiles { get; set; }
        public virtual DbSet<VCJnanaNewsArticle> VCJnanaNewsArticles { get; set; }
        public virtual DbSet<VCJnanaNewsArticleFile> VCJnanaNewsArticleFiles { get; set; }
        public virtual DbSet<VCJnanaNewsCat> VCJnanaNewsCats { get; set; }
        public virtual DbSet<VCJnanaFcm> VCJnanaFcms { get; set; }
        public virtual DbSet<VCJnanaFcmMessage> VCJnanaFcmMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<AspNetRole>(entity =>
            {
                //entity.ToTable("AspNetRoles");

                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.ConcurrencyStamp).HasMaxLength(255);
                entity.Property(e => e.Name).HasMaxLength(255);
                entity.Property(e => e.NormalizedName).HasMaxLength(255);
            });

            modelBuilder.Entity<AspNetUser>(entity =>
            {
                //entity.ToTable("AspNetUsers");

                entity.Property(e => e.Id).HasMaxLength(50);
                entity.Property(e => e.ConcurrencyStamp).HasMaxLength(50);
                entity.Property(e => e.PasswordHash).HasMaxLength(2000);
                entity.Property(e => e.SecurityStamp).HasMaxLength(50);
                entity.Property(e => e.PhoneNumber).HasMaxLength(100);

                entity.Property(e => e.Email).HasMaxLength(256);
                entity.Property(e => e.NormalizedEmail).HasMaxLength(256);

                entity.Property(e => e.UserName).IsRequired().HasMaxLength(256);
                entity.Property(e => e.NormalizedUserName).IsRequired().HasMaxLength(256);

                entity.HasIndex(e => e.NormalizedEmail).HasName("EmailIndex");
                entity.HasIndex(e => e.NormalizedUserName).HasName("UserNameIndex").IsUnique();

                //entity.Property(e => e.UserName).HasMaxLength(256);
                //entity.HasOne(d => d.Org)
                //.WithMany(p => p.AspNetUsers)
                //.HasForeignKey(d => d.OrgId)
                //.HasConstraintName("FK_AspNetUsers_ESOrganizations");
            });

            //modelBuilder.Entity<AdApplication>(entity =>
            //{
            //    //entity.HasIndex(e => e.ApplicationCode).IsUnique();

            //    //entity.HasMany(p => p.AppFunctions)
            //    //    .WithOne(b => b.Application)
            //    //    .HasForeignKey(p => p.CodeApplication)
            //    //    .HasPrincipalKey(b => b.CodeApplication);

            //    //entity.HasMany(p => p.Permissions)
            //    //    .WithOne(b => b.Application)
            //    //    .HasForeignKey(p => p.CodeApplication)
            //    //    .HasPrincipalKey(b => b.CodeApplication);
            //});

            //modelBuilder.Entity<AdFunction>(entity =>
            //{
            //    //entity.HasIndex(e => e.FunctionCode).IsUnique();

            //    //entity.HasOne(p => p.Parent)
            //    //    .WithMany(b => b.InverseParent)
            //    //    .HasForeignKey(p => p.ParentCode);

            //    //entity.HasMany(p => p.AppFunctions)
            //    //    .WithOne(b => b.Function)
            //    //    .HasForeignKey(p => p.CodeFunction)
            //    //    .HasPrincipalKey(b => b.Code);

            //    //entity.HasMany(p => p.Privileges)
            //    //    .WithOne(b => b.Function)
            //    //    .HasForeignKey(p => p.CodeFunction)
            //    //    .HasPrincipalKey(b => b.Code);

            //    //entity.HasMany(p => p.Permissions)
            //    //    .WithOne(b => b.Function)
            //    //    .HasForeignKey(p => p.CodeFunction)
            //    //    .HasPrincipalKey(b => b.Code);
            //});

            //modelBuilder.Entity<AdAppFunction>(entity =>
            //{
            //    //entity.HasKey(e => new { e.ApplicationCode, e.FunctionCode });

            //    //entity.HasOne(p => p.Application)
            //    //    .WithMany(b => b.AppFunctions)
            //    //    .HasForeignKey(p => p.CodeApplication);

            //    //entity.HasOne(p => p.Function)
            //    //    .WithMany(b => b.AppFunctions)
            //    //    .HasForeignKey(p => p.CodeFunction);
            //});

            //modelBuilder.Entity<AdGroupUser>(entity =>
            //{
            //    //entity.HasIndex(e => e.GroupUserCode).IsUnique();

            //    //entity.HasOne(p => p.Parent)
            //    //    .WithMany(b => b.InverseParent)
            //    //    .HasForeignKey(p => p.ParentCode);

            //    //entity.HasMany(p => p.AdUserInGroups)
            //    //    .WithOne(b => b.GroupUser)
            //    //    .HasForeignKey(p => p.Code_GroupUser)
            //    //    .HasPrincipalKey(b => b.Code_GroupUser);

            //    //entity.HasMany(p => p.AdPermissions)
            //    //    .WithOne(b => b.GroupUser)
            //    //    .HasForeignKey(p => p.Code_GroupUser)
            //    //    .HasPrincipalKey(b => b.Code_GroupUser);
            //});

            //modelBuilder.Entity<AdOrganization>(entity =>
            //{
            //});

            //modelBuilder.Entity<AdParameter>(entity =>
            //{
            //    //entity.ToTable("AdParameter");

            //    //entity.HasIndex(e => e.ParameterCode).IsUnique();

            //    //entity.HasOne(d => d.Group)
            //    //    .WithMany(p => p.AdParameters)
            //    //    .HasForeignKey(d => d.GroupId)
            //    //    .HasConstraintName("FK_ESParameters_ESGroupParameters");

            //    //entity.HasOne(p => p.Parent)
            //    //    .WithMany(b => b.InverseParent)
            //    //    .HasForeignKey(p => p.ParentCode);
            //});

            //modelBuilder.Entity<AdPermission>(entity =>
            //{
            //    //entity.HasOne(p => p.Application)
            //    //    .WithMany(b => b.Permissions)
            //    //    .HasForeignKey(p => p.CodeApplication);

            //    //entity.HasOne(p => p.Function)
            //    //    .WithMany(b => b.Permissions)
            //    //    .HasForeignKey(p => p.CodeFunction);

            //    //entity.HasOne(p => p.Resource)
            //    //    .WithMany(b => b.Permissions)
            //    //    .HasForeignKey(p => p.CodeResource);

            //    //entity.HasOne(p => p.User)
            //    //    .WithMany(b => b.AdPermissions)
            //    //    .HasForeignKey(p => p.UserId);

            //    //entity.HasOne(p => p.Role)
            //    //    .WithMany(b => b.AdPermissions)
            //    //    .HasForeignKey(p => p.RoleId);
            //});

            //modelBuilder.Entity<AdPrivilege>(entity =>
            //{
            //    //entity.HasKey(e => new { e.FunctionCode, e.ResourceCode });

            //    //entity.HasOne(p => p.Function)
            //    //    .WithMany(b => b.Privileges)
            //    //    .HasForeignKey(p => p.CodeFunction);

            //    //entity.HasOne(p => p.Resource)
            //    //    .WithMany(b => b.Privileges)
            //    //    .HasForeignKey(p => p.CodeResource);
            //});

            //modelBuilder.Entity<AdResource>(entity =>
            //{
            //    //entity.HasIndex(e => e.ResourceCode).IsUnique();

            //    //entity.HasOne(p => p.Parent)
            //    //    .WithMany(b => b.InverseParent)
            //    //    .HasForeignKey(p => p.ParentCode);

            //    //entity.HasMany(p => p.Privileges)
            //    //    .WithOne(b => b.Resource)
            //    //    .HasForeignKey(p => p.CodeResource)
            //    //    .HasPrincipalKey(b => b.Code);

            //    //entity.HasMany(p => p.Permissions)
            //    //    .WithOne(b => b.Resource)
            //    //    .HasForeignKey(p => p.CodeResource)
            //    //    .HasPrincipalKey(b => b.Code);
            //});

            //modelBuilder.Entity<AdUserInGroup>(entity =>
            //{
            //    //entity.HasOne(p => p.GroupUser)
            //    //    .WithMany(b => b.AdUserInGroups)
            //    //    .HasForeignKey(p => p.Code_GroupUser);

            //    //entity.HasOne(p => p.User)
            //    //    .WithMany(b => b.AdUserInGroups)
            //    //    .HasForeignKey(p => p.UserId);

            //    //entity.HasOne(p => p.Role)
            //    //    .WithMany(b => b.AdUserInGroups)
            //    //    .HasForeignKey(p => p.RoleId);
            //});                       

            base.OnModelCreating(modelBuilder);

        }

    }
}