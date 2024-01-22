using ESEIM.Models;
using Host.DbContexts;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public interface IUserLoginService
    {
        SessionUserLogin GetSessionUser(string userId);
    }

    public class UserLoginService : IUserLoginService
    {
        private EIMDBContext _context;
        private IParameterService _parameterService;
        private readonly IRepositoryService _repositoryService;

        public UserLoginService(EIMDBContext context, IParameterService parameterService, IRepositoryService repositoryService)
        {
            _context = context;
            _parameterService = parameterService;
            _repositoryService = repositoryService;
        }

        public SessionUserLogin GetSessionUser(string userId)
        {
            var session = new SessionUserLogin();
            var user = _context.Users.FirstOrDefault(x => x.Id == userId && x.Active == true);
            if (user != null)
            {
                session.Uuid = Guid.NewGuid().ToString();
                session.Area = user.Area;
                session.TypeStaff = user.TypeStaff;
                if (user.UserType != null) session.UserType = (short) user.UserType;
                session.UserId = user.Id;
                session.UserName = user.UserName;
                session.FullName = user.GivenName;
                session.Email = user.Email;
                session.EmployeeCode = user.EmployeeCode;
                session.SessionTimeOut = _parameterService.GetSessionTimeout();
                session.ExpireTimeSpan = DateTime.Now.AddMinutes(session.SessionTimeOut);
                session.Picture = user.Picture;
                session.BranchId = user.BranchId;
                session.DepartmentCode = user.DepartmentId;
                var listManagerUserName = !String.IsNullOrEmpty(user.LeadersOfUser) ? user.LeadersOfUser.Split(",", StringSplitOptions.None).ToList() : new List<string>();

                var timeStamp = DateTime.Now;
                session.TimeStamp = timeStamp;

                var jsonSessionLogin = new JsonSessionLogin
                {
                    TimeStamp = timeStamp,
                    Device = "Laptop/Desktop",
                    Ip = ""
                };

                var lstSessionLogin = new List<JsonSessionLogin>();

                if (!string.IsNullOrEmpty(user.SessionLogin))
                {
                    lstSessionLogin = JsonConvert.DeserializeObject<List<JsonSessionLogin>>(user.SessionLogin);
                    if (lstSessionLogin != null && lstSessionLogin.Count > 5)
                    {
                        lstSessionLogin.Remove(lstSessionLogin[lstSessionLogin.Count - 1]);
                    }

                    if (lstSessionLogin != null) lstSessionLogin.Add(jsonSessionLogin);
                }
                else
                {
                    lstSessionLogin.Add(jsonSessionLogin);
                }

                user.SessionLogin = JsonConvert.SerializeObject(lstSessionLogin);
                _context.Users.Update(user);
                _context.SaveChanges();

                session.ListGroupUser = _context.AdUserInGroups.Where(x => !x.IsDeleted && x.UserId == userId).GroupBy(p => p.GroupUserCode).Select(x => x.Key).ToList();
                session.ListRoleUser = _context.AdUserInGroups.Where(x => !x.IsDeleted && x.UserId == userId).GroupBy(p => p.RoleId).Select(x => x.Key).ToList();
                session.ListRoleGroupUser = _context.AdUserInGroups.Where(x => !x.IsDeleted && x.UserId == userId).GroupBy(p => new { p.RoleId, p.GroupUserCode }).Select(z => new GroupRole { GroupUserCode = z.Key.GroupUserCode, RoleId = z.Key.RoleId }).ToList();
                if (session.ListGroupUser.Any(p => p.Equals("SUB_ADMIN")))
                {
                    session.IsSubAdmin = true;
                }

                session.ListDepartment = _context.AdOrganizations.FirstOrDefault(x => x.IsEnabled && x.OrgAddonCode == user.BranchId)?.DepartmentCode.Split(",", StringSplitOptions.None).ToList();
                if (session.ListDepartment != null && !session.ListDepartment.Any(x => x.Equals(user.DepartmentId)))
                    session.ListDepartment.Add(user.DepartmentId);

                session.ListUser = _context.Users.Where(x => x.Active && x.BranchId == user.BranchId).Select(x => x.Id).ToList();
                var userInBranch = _context.Users.Where(x => x.Active && x.BranchId == user.BranchId);
                session.ListProject = _context.Projects.Where(x => !x.FlagDeleted && userInBranch.Any(p => p.UserName.Equals(x.CreatedBy))).Select(x => x.ProjectCode).ToList();
                session.ListContract = _context.PoSaleHeaders.Where(x => !x.IsDeleted && userInBranch.Any(p => p.UserName.Equals(x.CreatedBy))).Select(x => x.ContractCode).ToList();
                var roleCode = (from a in _context.UserRoles.Where(x => x.UserId == userId)
                                join b in _context.Roles on a.RoleId equals b.Id
                                select b).FirstOrDefault();
                if (roleCode != null)
                {
                    session.RoleCode = roleCode.Code;
                    var roleId = roleCode.Id;
                    session.ListRoleUser.Add(roleId);
                }

                if (session.UserType == 10 || session.DepartmentCode == "DEPARTMENT_LEADER" && session.BranchId == "b_ALL")
                {
                    session.IsAllData = true;
                }
                else if (session.BranchId != "b_ALL")
                {
                    if (session.DepartmentCode == "DEPARTMENT_LEADER")
                    {
                        session.IsBranch = true;
                        session.ListUserOfBranch = _context.Users.Where(x => x.BranchId == user.BranchId && x.Active).Select(x => x.UserName).ToList();
                    }
                    else
                    {
                        session.IsUser = true;
                    }
                }

                if (session.UserType != 10)
                {
                    string[] param = new string[] { "@userId" };
                    object[] val = new object[] { session.UserId };
                    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_PERMISSION_BY_USER", param, val);
                    session.Permissions = CommonUtil.ConvertDataTable<PermissionObject>(rs);
                }
            }
            return session;
        }
    }
}
