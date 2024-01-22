using System;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Globalization;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Drawing;
using Microsoft.AspNetCore.Hosting;
using System.Net;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AssetController> _stringLocalizer;
        private readonly IStringLocalizer<FilePluginController> _stringLocalizerFp;
        private readonly IStringLocalizer<MaterialProductAttributeMainController> _stringLocalizerMpam;
        private readonly IStringLocalizer<CustomerController> _stringLocalizerCus;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<ContractController> _contractController;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizerFile;
        private readonly IStringLocalizer<MaterialProductAssetController> _stringLocalizerAttr;
        private readonly IStringLocalizer<SupplierController> _stringLocalizerSup;
        private readonly IStringLocalizer<MaterialProductController> _stringMaterialProdLocalizer;
        private readonly IStringLocalizer<EDMSRepositoryController> _edmsRepositoryController;
        private readonly IStringLocalizer<CommonSettingController> _commonSettingController;

        public AssetController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractController> contractController, IStringLocalizer<AssetController> stringLocalizer, 
            IStringLocalizer<FilePluginController> stringLocalizerFp,
            IStringLocalizer<MaterialProductAttributeMainController> stringLocalizerMpam,
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<MaterialProductAssetController> stringLocalizerAttr,
            IStringLocalizer<CustomerController> stringLocalizerCus, IStringLocalizer<FileObjectShareController> stringLocalizerFile,
            IStringLocalizer<MaterialProductController> stringMaterialProdLocalizer, IStringLocalizer<SupplierController> stringLocalizerSup,
            IStringLocalizer<EDMSRepositoryController> edmsRepositoryController, IStringLocalizer<CommonSettingController> commonSettingController)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerFp = stringLocalizerFp;
            _stringLocalizerMpam = stringLocalizerMpam;
            _sharedResources = sharedResources;
            _stringLocalizerCus = stringLocalizerCus;
            _stringLocalizerFile = stringLocalizerFile;
            _stringLocalizerAttr = stringLocalizerAttr;
            _stringLocalizerSup = stringLocalizerSup;
            _contractController = contractController;
            _stringMaterialProdLocalizer = stringMaterialProdLocalizer;
            _edmsRepositoryController = edmsRepositoryController;
            _commonSettingController = commonSettingController;
        }
        [Breadcrumb("ViewData.CrumbAsset", AreaName = "Admin", FromAction = "Index", FromController = typeof(MenuAssetOperationController))]

        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbAsset"] = _sharedResources["COM_CRUMB_ASSET"];
            return View();
        }

        #region Index

        [HttpPost]
        public JsonResult JTableAsset([FromBody]JTableModelAsset jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetMains.Where(x => !x.IsDeleted)
                        join b in _context.Suppliers on a.SupplierCode equals b.SupCode into b1
                        from b2 in b1.DefaultIfEmpty()
                        join c in _context.AssetTypes.Where(x => !x.IsDeleted) on a.AssetType equals c.CatCode into c1
                        from c2 in c1.DefaultIfEmpty()
                        join d in _context.AssetGroups on a.AssetGroup equals d.Code into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings on a.Status equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.CommonSettings on a.Currency equals f.CodeSet into f1
                        from f2 in f1.DefaultIfEmpty()
                        join g in _context.AssetEntityMappings.Where(x => !x.IsDeleted) on a.AssetCode equals g.AssetCode into g1
                        from g in g1.DefaultIfEmpty()
                        join h in _context.EDMSWareHouseAssets.Where(x => !x.WHS_Flag) on g.WHS_Code equals h.WHS_Code into h1
                        from h in h1.DefaultIfEmpty()
                        join k in _context.EDMSFloorAssets on g.FloorCode equals k.FloorCode into k1
                        from k in k1.DefaultIfEmpty()
                        join j in _context.EDMSLineAssets on g.LineCode equals j.LineCode into j1
                        from j in j1.DefaultIfEmpty()
                        join i in _context.EDMSRackAssets on g.RackCode equals i.RackCode into i1
                        from i in i1.DefaultIfEmpty()

                        where (string.IsNullOrEmpty(jTablePara.AssetCode) || (a.AssetCode.ToLower().Contains(jTablePara.AssetCode.ToLower()) || a.AssetName.ToLower().Contains(jTablePara.AssetCode)))
                        && (string.IsNullOrEmpty(jTablePara.ManagerId) || a.UserResponsible.Equals(jTablePara.ManagerId))
                        && (string.IsNullOrEmpty(jTablePara.AssetGroup) || a.AssetGroup.Equals(jTablePara.AssetGroup))
                        && (string.IsNullOrEmpty(jTablePara.AssetType) || a.AssetType.Equals(jTablePara.AssetType))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status.ToLower().Contains(jTablePara.Status.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.WHS_Code) || g.WHS_Code.Equals(jTablePara.WHS_Code))
                        && (string.IsNullOrEmpty(jTablePara.FloorCode) || g.FloorCode.Equals(jTablePara.FloorCode))
                        && (string.IsNullOrEmpty(jTablePara.LineCode) || g.LineCode.Equals(jTablePara.LineCode))
                        && (string.IsNullOrEmpty(jTablePara.RackCode) || g.RackCode.Equals(jTablePara.RackCode))
                        && (string.IsNullOrEmpty(jTablePara.RackPosition) || g.RackPosition.ToLower().Contains(jTablePara.RackPosition.ToLower()))
                        && (fromDate == null || a.BuyedTime >= fromDate)
                        && (toDate == null || a.BuyedTime <= toDate)
                        select new
                        {
                            a.AssetID,
                            a.AssetCode,
                            AssetName = string.IsNullOrEmpty(a.OrderNo) ? a.AssetName : string.Format("{0} ({1})", a.AssetName, a.OrderNo),
                            a.Cost,
                            a.BuyedTime,
                            a.ExpiredDate,
                            a.PathIMG,
                            SupplierName = b2.SupName,
                            AssetType = c2.CatName,
                            AssetGroup = d2.Name,
                            Status = e2.ValueSet,
                            Currency = f2.ValueSet,
                            Postion = g != null ? (h.WHS_Name + ", " + k.FloorName + ", " + j.L_Text + ", " + (g != null ? i.RackName : "") + ", Vị trí: " + g.RackPosition) : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "AssetID", "AssetCode", "AssetName", "AssetGroup",
                    "AssetType", "SupplierName", "BuyedTime", "ExpiredDate", "Cost", "Currency", "PathIMG", "Status", "Postion");
            return Json(jdata);
        }

        [HttpPost]
        public object InsertAsset([FromBody]AssetMainRes obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.AssetMains.FirstOrDefault(x => x.AssetCode.Equals(obj.AssetCode));
                if (check == null)
                {
                    DateTime? buyedTime = !string.IsNullOrEmpty(obj.BuyedTime) ? DateTime.ParseExact(obj.BuyedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? expiredDate = !string.IsNullOrEmpty(obj.ExpiredDate) ? DateTime.ParseExact(obj.ExpiredDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var assetMain = new AssetMain()
                    {
                        AssetCode = obj.AssetCode,
                        AssetName = obj.AssetName,
                        AssetGroup = obj.AssetGroup,
                        AssetType = obj.AssetType,
                        Description = obj.Description,
                        PathIMG = obj.PathIMG,
                        Status = obj.Status,
                        BuyedTime = buyedTime,
                        ExpiredDate = expiredDate,
                        Cost = obj.Cost,
                        Currency = obj.Currency,
                        SupplierCode = obj.SupplierCode,
                        LocationText = obj.LocationText,
                        LocationGps = obj.LocationGps,
                        LocationSet = obj.LocationSet,
                        Branch = obj.Branch,
                        Department = obj.Department,
                        UserResponsible = obj.UserResponsible,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.AssetMains.Add(assetMain);
                    _context.SaveChanges();
                    //msg.Title = "Thêm mới tài sản thành công";
                    msg.Title = _stringLocalizer["ASSET_MSG_ADD_ASSET_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object InsertAssetAuto([FromBody]AssetMainRes obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.AssetMains.FirstOrDefault(x => x.AssetCode.Equals(obj.AssetCode));
                if (check == null)
                {
                    DateTime? buyedTime = !string.IsNullOrEmpty(obj.BuyedTime) ? DateTime.ParseExact(obj.BuyedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? expiredDate = !string.IsNullOrEmpty(obj.ExpiredDate) ? DateTime.ParseExact(obj.ExpiredDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var monthNow = DateTime.Now.Month;
                    var yearNow = DateTime.Now.Year;
                    var assetCode = string.Empty;
                    var no = 1;
                    var orderNo = 0;
                    var noText = "01";
                    var data = _context.AssetMains.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
                    var asset = _context.AssetMains.Where(x => x.AssetName.Equals(obj.AssetName)).ToList();
                    var assetAttrTemps = _context.AssetAttrGalaxys.Where(x => !x.IsDeleted && x.AssetCode.Equals(obj.AssetCodeTemp)).ToList();
                    if (data != null)
                    {
                        msg.Object = data;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Chưa có tài sản nào thuộc loại đã chọn";
                    }


                    if (obj.Quantity != null && obj.Quantity > 0)
                    {
                        no = data.Count + 1;
                        orderNo = asset.Count > 1 ? asset.Count + 1 : 1;
                        for (int i = 0; i < obj.Quantity; i++)
                        {
                            noText = no > 0 && no < 10 ? string.Format("0{0}", no) : no.ToString();
                            assetCode = string.Format("{0}{1}{2}{3}", "ASSET_", "T" + monthNow + ".", yearNow + "_", noText);

                            var assetMain = new AssetMain()
                            {
                                AssetCode = assetCode,
                                AssetName = obj.AssetName,
                                AssetGroup = obj.AssetGroup,
                                AssetType = obj.AssetType,
                                Description = obj.Description,
                                PathIMG = obj.PathIMG,
                                Status = obj.Status,
                                BuyedTime = buyedTime,
                                ExpiredDate = expiredDate,
                                Cost = obj.Cost,
                                Currency = obj.Currency,
                                SupplierCode = obj.SupplierCode,
                                LocationText = obj.LocationText,
                                LocationGps = obj.LocationGps,
                                LocationSet = obj.LocationSet,
                                Branch = obj.Branch,
                                Department = obj.Department,
                                UserResponsible = obj.UserResponsible,
                                CreatedBy = ESEIM.AppContext.UserName,
                                CreatedTime = DateTime.Now,
                                OrderNo = orderNo.ToString()
                            };
                            _context.AssetMains.Add(assetMain);

                            foreach (var item in assetAttrTemps)
                            {
                                var attr = new AssetAttrGalaxy
                                {
                                    AssetCode = assetCode,
                                    AttrCode = item.AttrCode,
                                    AttrValue = item.AttrValue,
                                    CreatedBy = User.Identity.Name,
                                    CreatedTime = DateTime.Now
                                };

                                _context.AssetAttrGalaxys.Add(attr);
                            }

                            no++;
                            orderNo++;
                        }

                        _context.SaveChanges();
                    }
                    else
                    {
                        var assetMain = new AssetMain()
                        {
                            AssetCode = obj.AssetCode,
                            AssetName = obj.AssetName,
                            AssetGroup = obj.AssetGroup,
                            AssetType = obj.AssetType,
                            Description = obj.Description,
                            PathIMG = obj.PathIMG,
                            Status = obj.Status,
                            BuyedTime = buyedTime,
                            ExpiredDate = expiredDate,
                            Cost = obj.Cost,
                            Currency = obj.Currency,
                            SupplierCode = obj.SupplierCode,
                            LocationText = obj.LocationText,
                            LocationGps = obj.LocationGps,
                            LocationSet = obj.LocationSet,
                            Branch = obj.Branch,
                            Department = obj.Department,
                            UserResponsible = obj.UserResponsible,
                            CreatedBy = ESEIM.AppContext.UserName,
                            CreatedTime = DateTime.Now
                        };
                        _context.AssetMains.Add(assetMain);

                        foreach (var item in assetAttrTemps)
                        {
                            var attr = new AssetAttrGalaxy
                            {
                                AssetCode = obj.AssetCode,
                                AttrCode = item.AttrCode,
                                AttrValue = item.AttrValue,
                                CreatedBy = User.Identity.Name,
                                CreatedTime = DateTime.Now
                            };

                            _context.AssetAttrGalaxys.Add(attr);
                        }

                        _context.SaveChanges();
                        msg.Object = assetMain.AssetID;
                    }

                    //msg.Title = "Thêm mới tài sản thành công";
                    msg.Title = _stringLocalizer["ASSET_MSG_ADD_ASSET_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItem(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var data = _context.AssetMains.FirstOrDefault(x => x.AssetID == id && !x.IsDeleted);
            if (data != null)
            {
                data.sBuyedTime = data.BuyedTime.HasValue ? data.BuyedTime.Value.ToString("dd/MM/yyyy") : null;
                data.sExpiredDate = data.ExpiredDate.HasValue ? data.ExpiredDate.Value.ToString("dd/MM/yyyy") : null;
                var quantity = _context.AssetMains.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.Branch) && !string.IsNullOrEmpty(data.Branch) && x.Branch.Equals(data.Branch)).Count();
                data.QuantityTotal = quantity > 0 ? quantity : 1;
            }
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public object GetAssetSuggestions(string assetGroup, string assetType)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var assetAttrGalaxy = _context.AssetAttrGalaxys;
            var data = _context.AssetMains.Where(x => (string.IsNullOrEmpty(assetType) || x.AssetType == assetType) && (string.IsNullOrEmpty(assetGroup) || x.AssetGroup == assetGroup) && !x.IsDeleted && assetAttrGalaxy.Any(p => p.AssetCode.Equals(x.AssetCode) && !p.IsDeleted)).LastOrDefault() != null
                ? _context.AssetMains.Where(x => (string.IsNullOrEmpty(assetType) || x.AssetType == assetType) && (string.IsNullOrEmpty(assetGroup) || x.AssetGroup == assetGroup) && !x.IsDeleted && assetAttrGalaxy.Any(p => p.AssetCode.Equals(x.AssetCode) && !p.IsDeleted)).LastOrDefault()
                : _context.AssetMains.LastOrDefault(x => (string.IsNullOrEmpty(assetType) || x.AssetType == assetType) && (string.IsNullOrEmpty(assetGroup) || x.AssetGroup == assetGroup) && !x.IsDeleted);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = "Chưa có tài sản nào thuộc loại đã chọn";
            }

            return Json(msg);
        }

        [HttpPost]
        public object UpdateAsset([FromBody]AssetMainRes obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkID = _context.AssetMains.FirstOrDefault(x => x.AssetID.Equals(obj.AssetID));
                if (checkID != null)
                {
                    var data = _context.AssetMains.FirstOrDefault(x => x.AssetCode.Equals(obj.AssetCode));
                    DateTime? buyedTime = !string.IsNullOrEmpty(obj.sBuyedTime) ? DateTime.ParseExact(obj.sBuyedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? expiredDate = !string.IsNullOrEmpty(obj.sExpiredDate) ? DateTime.ParseExact(obj.sExpiredDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    if (data != null)
                    {
                        data.AssetName = obj.AssetName;
                        data.AssetGroup = obj.AssetGroup;
                        data.AssetType = obj.AssetType;
                        data.Description = obj.Description;
                        data.PathIMG = obj.PathIMG;
                        data.LocationText = obj.LocationText;
                        data.LocationGps = obj.LocationGps;
                        data.Status = obj.Status;
                        data.Cost = obj.Cost;
                        data.BuyedTime = buyedTime;
                        data.ExpiredDate = expiredDate;
                        data.SupplierCode = obj.SupplierCode;
                        data.LocationSet = obj.LocationSet;
                        data.Branch = obj.Branch;
                        data.Department = obj.Department;
                        data.UserResponsible = obj.UserResponsible;
                        data.Currency = obj.Currency;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;

                        _context.AssetMains.Update(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ASSET_MSG_UPDATE_FAILED"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_UPDATE_FAILED"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage();
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object DeleteAsset(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetMains.FirstOrDefault(x => x.AssetID == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.AssetMains.Update(data);
                _context.SaveChanges();

                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue(""));// "Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue(""));//"Có lỗi xảy ra khi xóa!";
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpGet]
        public JsonResult GenAssetCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.AssetMains.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "ASSET_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpPost]
        public object GetAsset(int id)
        {
            var data = _context.AssetMains.FirstOrDefault(x => x.AssetID == id);
            return Json(data);
        }

        [HttpPost]
        public object GetAllSupplier()
        {
            var data = _context.Suppliers.Select(x => new { x.SupCode, x.SupName }).AsNoTracking();
            return Json(data);
        }

        [HttpPost]
        public object GetCurrency()
        {
            return GetCurrencyBase();
        }
        [HttpPost]
        public object GetStatus()
        {
            //var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            var data = _context.CommonSettings.Where(x => x.Group == "SERVICE_STATUS").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpPost]
        public JsonResult GetDepartment()
        {
            var data = _context.AdDepartments.Where(x => !x.IsDeleted && x.IsEnabled).Select(x => new { Code = x.DepartmentCode, Name = x.Title });
            return Json(data);
        }
        [HttpPost]
        public JsonResult GetBranch()
        {
            var data = _context.AdOrganizations.Where(x => x.IsEnabled).Select(x => new { Code = x.OrgAddonCode, Name = x.OrgName });
            return Json(data);
        }
        public object GetPerson()
        {
            var data = _context.HREmployees.Where(x => x.flag.Value == 1).Select(x => new { Code = x.Id.ToString(), Name = x.fullname }).ToList();
            return data;
        }

        [HttpPost]
        public List<TreeView> GetAssetType()
        {
            var data = _context.AssetTypes.Where(x => !x.IsDeleted).OrderBy(x => x.CatName).AsNoTracking();
            var dataOrder = GetAssetTypeSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetAssetTypeSubTreeData(List<AssetType> data, int? Parent, List<TreeView> lstCategories, int tab)
        {
            var contents = Parent == null
                ? data.Where(x => x.CatParent == null).OrderBy(x => x.CatName).AsParallel()
                : data.Where(x => x.CatParent == Parent).OrderBy(x => x.CatName).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.CatCode,
                    Title = item.CatName,
                    ParentId = item.CatParent,
                    Level = tab,
                    HasChild = data.Any(x => x.CatParent == item.Id)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetAssetTypeSubTreeData(data, item.Id, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public List<TreeView> GetAssetGroup()
        {
            var data = _context.AssetGroups.Where(x => !x.IsDeleted).OrderBy(x => x.Name).AsNoTracking();
            var dataOrder = GetAssetGroupSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
            return dataOrder;
        }

        private List<TreeView> GetAssetGroupSubTreeData(List<AssetGroup> data, int? Parent, List<TreeView> lstCategories, int tab)
        {
            var contents = Parent == null
                ? data.Where(x => x.ParentID == null).OrderBy(x => x.Name).AsParallel()
                : data.Where(x => x.ParentID == Parent).OrderBy(x => x.Name).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.Code,
                    Title = item.Name,
                    ParentId = item.ParentID,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentID == item.Id)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetAssetGroupSubTreeData(data, item.Id, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }

        [HttpPost]
        public byte[] GeneratorPicture(string path)
        {
            path = _hostingEnvironment.WebRootPath + path;
            try
            {
                using (Image image = Image.FromFile(path))
                {
                    using (MemoryStream m = new MemoryStream())
                    {
                        image.Save(m, image.RawFormat);
                        byte[] imageBytes = m.ToArray();
                        return imageBytes;
                    }
                }
            }
            catch (Exception ex)
            {
                return new Byte[64];
            }
        }
        #endregion

        #region AssetAttribute old
        public class JTableModelAttr : JTableModel
        {
            public string AssetCode { get; set; }
            public string AttrCode { get; set; }
            public string AttrValue { get; set; }
            public string AttrName { get; set; }
        }

        [HttpPost]
        public object JTableAttr([FromBody]JTableModelAttr jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetAttributes
                        where (a.IsDeleted == false && a.AssetCode.Equals(jTablePara.AssetCode))
                            && (string.IsNullOrEmpty(jTablePara.AttrCode) || a.AttrCode.ToLower().Contains(jTablePara.AttrCode.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.AttrValue) || a.AttrValue.ToLower().Contains(jTablePara.AttrValue.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.AttrName) || a.AttrName.ToLower().Contains(jTablePara.AttrName.ToLower()))
                        select new
                        {
                            a.AttrID,
                            a.AttrCode,
                            a.AttrName,
                            a.AttrValue,
                        };
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "AttrID", "AttrCode", "AttrName", "AttrValue");
            return Json(jdata);
        }

        [HttpPost]
        public object GetAttr(int id)
        {
            var data = _context.AssetAttributes.FirstOrDefault(x => x.AttrID == id);
            return Json(data);
        }

        [HttpPost]
        public object InsertAttr([FromBody]AssetAttribute obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.AssetAttributes.FirstOrDefault(x => x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                if (check == null)
                {
                    var assetAttr = new AssetAttribute()
                    {
                        AttrCode = obj.AttrCode,
                        AttrName = obj.AttrName,
                        AssetCode = obj.AssetCode,
                        AttrValue = obj.AttrValue,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.AssetAttributes.Add(assetAttr);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_ATTR_EXIST"];
                    //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("ASSET_CURD_TAB_ATTRIBUTE_CURD_LBL_ATTR_CODE"));//"Mã thuộc tính đã tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("ASSET_CURD_TAB_ATTRIBUTE"));// "Có lỗi xảy ra khi xóa thuộc tính!";
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItemAttr(int id)
        {
            var msg = new JMessage() { Error = false };
            var data = _context.AssetAttributes.FirstOrDefault(x => x.AttrID == id && !x.IsDeleted);
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public object UpdateAttr([FromBody]AssetAttribute obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkId = _context.AssetAttributes.FirstOrDefault(x => !x.IsDeleted && x.AttrID == obj.AttrID);
                if (checkId != null)
                {
                    var data = _context.AssetAttributes.FirstOrDefault(x => !x.IsDeleted && x.AssetCode.Equals(obj.AssetCode));
                    if (data != null)
                    {
                        data.AttrName = obj.AttrName;
                        data.AttrValue = obj.AttrValue;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.AssetAttributes.Update(data);
                        _context.SaveChanges();
                        msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ASSET_MSG_ATTR_NOT_EXIST"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_ATTR_NOT_FOUND_ATTR"];
                }
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                throw;
            }
        }


        [HttpPost]
        public object DeleteAttr(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetAttributes.FirstOrDefault(x => x.AttrID == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.AssetAttributes.Update(data);
                _context.SaveChanges();
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("ASSET_CURD_TAB_ATTRIBUTE")); //"Xóa thuộc tính thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                //msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("ASSET_CURD_TAB_ATTRIBUTE")); //"Có lỗi xảy ra khi xóa!";
            }
            return Json(msg);
        }
        [HttpPost]
        public object JTableHistoryRun()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 4);
            dictionary.Add("recordsTotal", 4);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Title", "Hợp đồng mua sắm");
            data.Add("TimeFrom", "05/06/2019");
            data.Add("TimeTo", "06/06/2019");
            data.Add("Expense", "100.000.000VND");
            data.Add("Status", "Đã thanh toán");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Title", "Cho mượn");
            data.Add("TimeFrom", "10/07/2019");
            data.Add("TimeTo", "17/07/2019");
            data.Add("Expense", "0VND");
            data.Add("Status", "Đã hoàn trả");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "3");
            data.Add("Title", "Bảo trì sửa chữa");
            data.Add("TimeFrom", "20/07/2019");
            data.Add("TimeTo", "20/07/2019");
            data.Add("Expense", "0VND");
            data.Add("Status", "Đã xong");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "3");
            data.Add("Title", "Bảo trì sửa chữa");
            data.Add("TimeFrom", "22/07/2019");
            data.Add("TimeTo", "22/07/2019");
            data.Add("Expense", "0VND");
            data.Add("Status", "Đã xong");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "4");
            data.Add("Title", "Thanh lý");
            data.Add("TimeFrom", "01/08/2019");
            data.Add("TimeTo", "10/08/2019");
            data.Add("Expense", "80.000.000VND");
            data.Add("Status", "Đã thanh lý");
            datas.Add(data);

            dictionary.Add("data", datas);
            var count = dictionary.Count();

            return Json(dictionary);
        }
        [HttpPost]
        public object JTableMaintenanceHistory()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Maintenance", "Sửa chữa nhỏ");
            data.Add("Type", "Sửa chữa");
            data.Add("Unit", "VNĐ");
            data.Add("Time", "20/07/2019");
            data.Add("Note", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Address", "");
            data.Add("Status", "");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Maintenance", "Bảo dưỡng đinh kỳ");
            data.Add("Type", "Bảo dưỡng");
            data.Add("Unit", "VNĐ");
            data.Add("Time", "22/07/2019");
            data.Add("Note", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Address", "");
            data.Add("Status", "");
            datas.Add(data);


            dictionary.Add("data", datas);
            var count = dictionary.Count();

            return Json(dictionary);
        }
        #endregion

        #region File
        public class JTableModelFile : JTableModel
        {
            public string AssetCode { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CatCode { get; set; }
            public int? FileID { get; set; }
        }

        [HttpPost]
        public object JTableFile([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode))
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = ((from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                          join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                          join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                          from f in f1.DefaultIfEmpty()
                          select new
                          {
                              a.Id,
                              b.FileCode,
                              b.FileName,
                              b.FileTypePhysic,
                              b.Desc,
                              b.CreatedTime,
                              b.CloudFileId,
                              TypeFile = "NO_SHARE",
                              ReposName = f != null ? f.ReposName : "",
                              b.IsFileMaster,
                              b.EditedFileBy,
                              b.EditedFileTime,
                              b.FileID,
                          }).Union(
                  from a in _context.EDMSObjectShareFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                  join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.IsFileMaster == null || x.IsFileMaster == true) on a.FileCode equals b.FileCode
                  join f in _context.EDMSRepositorys on b.ReposCode equals f.ReposCode into f1
                  from f in f1.DefaultIfEmpty()
                  select new
                  {
                      a.Id,
                      b.FileCode,
                      b.FileName,
                      b.FileTypePhysic,
                      b.Desc,
                      b.CreatedTime,
                      b.CloudFileId,
                      TypeFile = "NO_SHARE",
                      ReposName = f != null ? f.ReposName : "",
                      b.IsFileMaster,
                      b.EditedFileBy,
                      b.EditedFileTime,
                      b.FileID,
                  })).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            return jdata;
        }

        [HttpPost]
        public object JTableFileHistory([FromBody]JTableModelFile jTablePara)
        {
            if (string.IsNullOrEmpty(jTablePara.AssetCode) || jTablePara.FileID == null)
            {
                return JTableHelper.JObjectTable(new List<object>(), jTablePara.Draw, 0, "Id", "FileName", "FileTypePhysic", "Desc", "Url", "CreatedTime", "UpdatedTime", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime", "FileID");
            }
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == jTablePara.AssetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset))
                         join b in _context.EDMSFiles.Where(x => !x.IsDeleted && x.FileParentId.Equals(jTablePara.FileID) && (x.IsFileMaster == null || x.IsFileMaster == false)) on a.FileCode equals b.FileCode
                         join f in _context.EDMSRepositorys on a.ReposCode equals f.ReposCode into f1
                         from f in f1.DefaultIfEmpty()
                         select new
                         {
                             a.Id,
                             b.FileCode,
                             b.FileName,
                             b.FileTypePhysic,
                             b.Desc,
                             b.CreatedTime,
                             b.CloudFileId,
                             TypeFile = "NO_SHARE",
                             ReposName = f != null ? f.ReposName : "",
                             b.IsFileMaster,
                             EditedFileBy = _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)) != null ? _context.Users.FirstOrDefault(x => x.UserName.Equals(b.EditedFileBy)).GivenName : "",
                             b.EditedFileTime,
                         }).AsNoTracking();
            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "FileCode", "FileName", "FileTypePhysic", "Desc", "CreatedTime", "CloudFileId", "ReposName", "TypeFile", "IsFileMaster", "EditedFileBy", "EditedFileTime");
            return jdata;
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
        [RequestSizeLimit(long.MaxValue)]
        public JsonResult InsertAssetFile(EDMSRepoCatFileModel obj, IFormFile fileUpload)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var mimeType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                string urlFile = "";
                string fileId = "";
                if (Array.IndexOf(LuceneExtension.fileMimetypes, mimeType) >= 0 && (Array.IndexOf(LuceneExtension.fileExt, extension.ToUpper()) >= 0))
                {
                    string reposCode = "";
                    string catCode = "";
                    string path = "";
                    string folderId = "";
                    //Chọn file ngắn gọn
                    if (!obj.IsMore)
                    {
                        //var suggesstion = GetSuggestionsAssetFile(obj.AssetCode);
                        //if (suggesstion != null)
                        //{
                        //    reposCode = suggesstion.ReposCode;
                        //    path = suggesstion.Path;
                        //    folderId = suggesstion.FolderId;
                        //    catCode = suggesstion.CatCode;
                        //}
                        //else
                        //{
                        //    msg.Error = true;
                        //    msg.Title = _stringLocalizerCus["CUS_TITLE_ENTER_EXPEND"];
                        //    return Json(msg);
                        //}

                        var repoDefault = _context.EDMSRepoDefaultObjects.FirstOrDefault(x => !x.IsDeleted
                               && x.ObjectCode.Equals(obj.AssetCode) && x.ObjectType.Equals(EnumHelper<ObjectType>.GetDisplayValue(ObjectType.Asset)));
                        if (repoDefault != null)
                        {
                            reposCode = repoDefault.ReposCode;
                            path = repoDefault.Path;
                            folderId = repoDefault.FolderId;
                            catCode = repoDefault.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _sharedResources["COM_MSG_PLS_SETUP_FOLDER_DEFAULT"];
                            return Json(msg);
                        }
                    }
                    //Hiển file mở rộng
                    else
                    {
                        var setting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                        if (setting != null)
                        {
                            reposCode = setting.ReposCode;
                            path = setting.Path;
                            folderId = setting.FolderId;
                            catCode = setting.CatCode;
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizerCus["CUS_ERROR_CHOOSE_FILE"];
                            return Json(msg);
                        }
                    }
                    var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == reposCode);
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        using (var ms = new MemoryStream())
                        {
                            fileUpload.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            urlFile = path + Path.Combine("/", fileUpload.FileName);
                            var urlFilePreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + fileUpload.FileName);
                            var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFile);
                            var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + urlFilePreventive);
                            var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileBytes, getRepository.Account, getRepository.PassWord);
                            if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                return Json(msg);
                            }
                            else if (result.Status == WebExceptionStatus.Success)
                            {
                                if (result.IsSaveUrlPreventive)
                                {
                                    urlFile = urlFilePreventive;
                                }
                            }
                            else
                            {
                                msg.Error = true;
                                msg.Title = _sharedResources["COM_MSG_ERR"];
                                return Json(msg);
                            }
                        }
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", fileUpload.FileName, fileUpload.OpenReadStream(), fileUpload.ContentType, folderId);
                    }
                    var edmsReposCatFile = new EDMSRepoCatFile
                    {
                        FileCode = string.Concat("ASSET", Guid.NewGuid().ToString()),
                        ReposCode = reposCode,
                        CatCode = catCode,
                        ObjectCode = obj.AssetCode,
                        ObjectType = EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset),
                        Path = path,
                        FolderId = folderId
                    };
                    _context.EDMSRepoCatFiles.Add(edmsReposCatFile);

                    /// created Index lucene
                    LuceneExtension.IndexFile(edmsReposCatFile.FileCode, fileUpload, string.Concat(_hostingEnvironment.WebRootPath, "\\uploads\\luceneIndex"));

                    //add File
                    var file = new EDMSFile
                    {
                        FileCode = edmsReposCatFile.FileCode,
                        FileName = fileUpload.FileName,
                        Desc = obj.Desc,
                        ReposCode = reposCode,
                        Tags = obj.Tags,
                        FileSize = fileUpload.Length,
                        FileTypePhysic = Path.GetExtension(fileUpload.FileName),
                        NumberDocument = obj.NumberDocument,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now,
                        Url = urlFile,
                        MimeType = mimeType,
                        CloudFileId = fileId,
                    };
                    _context.EDMSFiles.Add(file);
                    _context.SaveChanges();
                    msg.Title = _stringLocalizerCus["CUS_TITLE_ADD_FILE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCus["CUS_TITLE_FORMAT_FILE"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _stringLocalizerCus["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAssetFile(EDMSRepoCatFileModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                string path = "";
                string fileId = "";
                var oldSetting = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.FileCode == obj.FileCode);
                if (oldSetting != null)
                {
                    var newSetting = _context.EDMSCatRepoSettings.FirstOrDefault(x => x.Id == obj.CateRepoSettingId);
                    if (newSetting != null)
                    {
                        var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == oldSetting.FileCode);
                        //change folder
                        if ((string.IsNullOrEmpty(oldSetting.Path) && oldSetting.FolderId != newSetting.FolderId) || (string.IsNullOrEmpty(oldSetting.FolderId) && oldSetting.Path != newSetting.Path))
                        {
                            //dowload file old
                            var oldRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == oldSetting.ReposCode);
                            byte[] fileData = null;
                            if (oldRepo.Type == "SERVER")
                            {
                                string ftphost = oldRepo.Server;
                                string ftpfilepath = file.Url;
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + ftphost + ftpfilepath);
                                using (WebClient request = new WebClient())
                                {
                                    request.Credentials = new NetworkCredential(oldRepo.Account, oldRepo.PassWord);
                                    fileData = request.DownloadData(urlEnd);
                                }
                            }
                            else
                            {
                                fileData = FileExtensions.DownloadFileGoogle(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }
                            //delete folder old
                            if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + oldRepo.Server + file.Url);
                                FileExtensions.DeleteFileFtpServer(urlEnd, oldRepo.Account, oldRepo.PassWord);
                            }
                            else if (oldRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                            }

                            //insert folder new
                            var newRepo = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == newSetting.ReposCode);
                            if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                            {
                                path = newSetting.Path + Path.Combine("/", file.FileName);
                                var pathPreventive = path + Path.Combine("/", Guid.NewGuid().ToString().Substring(0, 8) + file.FileName);
                                var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + path);
                                var urlEndPreventive = System.Web.HttpUtility.UrlPathEncode("ftp://" + newRepo.Server + pathPreventive);
                                var result = FileExtensions.UploadFileToFtpServer(urlEnd, urlEndPreventive, fileData, newRepo.Account, newRepo.PassWord);
                                if (result.Status == WebExceptionStatus.ConnectFailure || result.Status == WebExceptionStatus.ProtocolError)
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_CONNECT_FAILURE"];
                                    return Json(msg);
                                }
                                else if (result.Status == WebExceptionStatus.Success)
                                {
                                    if (result.IsSaveUrlPreventive)
                                    {
                                        path = pathPreventive;
                                    }
                                }
                                else
                                {
                                    msg.Error = true;
                                    msg.Title = _sharedResources["COM_MSG_ERR"];
                                    return Json(msg);
                                }
                            }
                            else if (newRepo.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                            {
                                fileId = FileExtensions.UploadFileToDrive(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.FileName, new MemoryStream(fileData), file.MimeType, newSetting.FolderId);
                            }
                            file.CloudFileId = fileId;
                            file.Url = path;

                            //update setting new
                            oldSetting.CatCode = newSetting.CatCode;
                            oldSetting.ReposCode = newSetting.ReposCode;
                            oldSetting.Path = newSetting.Path;
                            oldSetting.FolderId = newSetting.FolderId;
                            _context.EDMSRepoCatFiles.Update(oldSetting);
                        }
                        //update header
                        file.Desc = obj.Desc;
                        file.Tags = obj.Tags;
                        file.NumberDocument = obj.NumberDocument;
                        _context.EDMSFiles.Update(file);
                        _context.SaveChanges();
                        msg.Title = _stringLocalizerCus["CUS_TITLE_UPDATE_INFO_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizerCus["CUS_ERROR_CHOOSE_FILE"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizerCus["CUS_TITLE_FILE_NOT_EXIST"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizerCus[""]);// "Có lỗi xảy ra khi cập nhật!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult DeleteAssetFile(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(x => x.Id == id);
                _context.EDMSRepoCatFiles.Remove(data);

                var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                _context.EDMSFiles.Remove(file);

                LuceneExtension.DeleteIndexFile(file.FileCode, _hostingEnvironment.WebRootPath + "\\uploads\\luceneIndex");
                var getRepository = _context.EDMSRepositorys.FirstOrDefault(x => x.ReposCode == data.ReposCode);
                if (getRepository != null)
                {
                    if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.Server))
                    {
                        var urlEnd = System.Web.HttpUtility.UrlPathEncode("ftp://" + getRepository.Server + file.Url);
                        FileExtensions.DeleteFileFtpServer(urlEnd, getRepository.Account, getRepository.PassWord);
                    }
                    else if (getRepository.Type == EnumHelper<TypeConnection>.GetDisplayValue(TypeConnection.GooglerDriver))
                    {
                        FileExtensions.DeleteFileGoogleServer(_hostingEnvironment.WebRootPath + "\\files\\credentials.json", _hostingEnvironment.WebRootPath + "\\files\\token.json", file.CloudFileId);
                    }
                }
                _context.SaveChanges();
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer[""]);// "Xóa thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer[""]);//"Có lỗi xảy ra khi xóa!";
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetAssetFile(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var model = new EDMSRepoCatFileModel();
            try
            {
                var data = _context.EDMSRepoCatFiles.FirstOrDefault(m => m.Id == id);
                if (data != null)
                {
                    var file = _context.EDMSFiles.FirstOrDefault(x => x.FileCode == data.FileCode);
                    //header file
                    model.FileCode = file.FileCode;
                    model.NumberDocument = file.NumberDocument;
                    model.Tags = file.Tags;
                    model.Desc = file.Desc;
                    //category file
                    model.CateRepoSettingCode = data.CatCode;
                    model.CateRepoSettingId = data.Id;
                    model.Path = data.Path;
                    model.FolderId = data.FolderId;
                    msg.Object = model;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CONTRACT_MSG_FILE_DOES_NOT_EXIST"]);//"Tệp tin không tồn tại!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = _stringLocalizer["CUS_TITLE_ERROR_TRYON"];
            }
            return Json(msg);
        }

        [HttpGet]
        public EDMSRepoCatFile GetSuggestionsAssetFile(string assetCode)
        {
            var query = _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == assetCode && x.ObjectType == EnumHelper<AssetEnum>.GetDisplayValue(AssetEnum.Asset)).MaxBy(x => x.Id);
            return query;
        }
        #endregion

        #region Attribute
        [HttpPost]
        public JsonResult GetListAssetAttributeMain()
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.AttrGalaxyAets.Where(x => !x.IsDeleted).Select(x => new { x.Code, x.Name });
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_NOT_FIND_OBJ"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        public class JtableAttributeModel : JTableModel
        {
            public string AssetCode { get; set; }
            public string AssetCodeTemp { get; set; }
        }

        [HttpPost]
        public object JTableAttribute([FromBody]JtableAttributeModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.AssetAttrGalaxys
                        join b in _context.AttrGalaxyAets on a.AttrCode equals b.Code into b1
                        from b2 in b1.DefaultIfEmpty()
                        where (a.AssetCode == jTablePara.AssetCode || a.AssetCode == jTablePara.AssetCodeTemp)
                        && a.IsDeleted == false
                        orderby a.Id descending
                        select new
                        {
                            a.Id,
                            a.AttrCode,
                            AttrName = b2 != null ? b2.Name : "",
                            a.AttrValue,
                            a.CreatedTime,
                            Unit = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Unit)).ValueSet : "" : "",
                            Group = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.Group)).ValueSet : "" : "",
                            DataType = b2 != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)) != null ? _context.CommonSettings.FirstOrDefault(x => x.CodeSet.Equals(b2.DataType)).ValueSet : "" : "",
                            Parent = b2 != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Code.Equals(b2.Parent)) != null ? _context.AttrGalaxys.FirstOrDefault(x => x.Parent.Equals(b2.Parent)).Name : "" : ""
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "AttrCode", "AttrName", "AttrValue", "CreatedTime", "Unit", "Group", "DataType", "Parent");

            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertAttributeMore([FromBody]AssetAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.AssetMains.FirstOrDefault(x => x.AssetCode == obj.AssetCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var data = _context.AssetAttrGalaxys.FirstOrDefault(x => x.AssetCode.Equals(obj.AssetCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (data != null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ASSET_MSG_ASSET_ALREADY_EXIST"];
                    }
                    else
                    {
                        AssetAttrGalaxy objNew = new AssetAttrGalaxy();

                        objNew.AssetCode = obj.AssetCode;
                        objNew.AttrCode = obj.AttrCode;
                        objNew.AttrValue = obj.AttrValue;
                        objNew.CreatedTime = DateTime.Now;
                        objNew.CreatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.AssetAttrGalaxys.Add(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["ASSET_MSG_ERROR"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetDetailAttributeMore(int Id)
        {
            JMessage msg = new JMessage();
            try
            {
                var objNew = _context.AssetAttrGalaxys.FirstOrDefault(x => x.Id == Id);
                if (objNew == null)
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ASSET_MSG_NOT_FIND_OBJ"];
                }
                else
                {
                    msg.Error = false;
                    msg.Object = objNew;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAttributeMore([FromBody]AssetAttrGalaxy obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var parent = _context.AssetMains.FirstOrDefault(x => x.AssetCode == obj.AssetCode && x.IsDeleted == false);
                if (parent != null)
                {
                    var objNew = _context.AssetAttrGalaxys.FirstOrDefault(x => x.AssetCode.Equals(obj.AssetCode) && x.AttrCode.Equals(obj.AttrCode) && !x.IsDeleted);
                    if (objNew == null)
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ASSET_MSG_ATTR_NOT_FOUND_ATTR"];
                    }
                    else
                    {
                        objNew.AssetCode = obj.AssetCode;
                        objNew.AttrValue = obj.AttrValue;

                        objNew.UpdatedTime = DateTime.Now;
                        objNew.UpdatedBy = ESEIM.AppContext.UserName;
                        objNew.IsDeleted = false;

                        _context.AssetAttrGalaxys.Update(objNew);
                        _context.SaveChanges();
                        msg.Error = false;
                        msg.Title = _stringLocalizer["ASSET_MSG_UPDATE_PROPERTY_SUCCESS"];
                    }
                }
                else
                {
                    msg.Error = false;
                    msg.Title = _stringLocalizer["ASSET_MSG_ERROR"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateAttributeMoreAll([FromBody]List<AssetAttrGalaxyEx> ListObj)
        {
            JMessage msg = new JMessage();
            try
            {
                foreach (var obj in ListObj)
                {
                    var parent = _context.AssetMains.FirstOrDefault(x => x.AssetCode == obj.AssetCode && !x.IsDeleted);
                    if (parent != null)
                    {
                        var objNew = _context.AssetAttrGalaxys.FirstOrDefault(x => x.Id.Equals(obj.Id) && !x.IsDeleted);
                        if (objNew == null)
                        {
                            msg.Error = true;
                            msg.Title = _stringLocalizer["ASSET_MSG_ATTR_NOT_FOUND_ATTR"];
                        }
                        else
                        {
                            objNew.AttrValue = obj.AttrValue;

                            objNew.UpdatedTime = DateTime.Now;
                            objNew.UpdatedBy = ESEIM.AppContext.UserName;

                            _context.AssetAttrGalaxys.Update(objNew);
                            _context.SaveChanges();
                            msg.Error = false;
                            msg.Title = _stringLocalizer["ASSET_MSG_UPDATE_PROPERTY_SUCCESS"];
                        }
                    }
                    else
                    {
                        msg.Error = false;
                        msg.Title = _stringLocalizer["ASSET_MSG_ERROR"];
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["MLP_MSG_ERROR_EDIT"];
            }
            return Json(msg);
        }


        [HttpPost]
        public object DeleteAttributeMore(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.AssetAttrGalaxys.FirstOrDefault(x => x.Id == id);
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;
                data.IsDeleted = true;
                _context.AssetAttrGalaxys.Update(data);
                _context.SaveChanges();
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        #endregion

        #region Arrange asset to store
        [HttpPost]
        public JsonResult ArrangeAsset([FromBody]AssetZoneMapping obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var check = _context.AssetZoneMappings.FirstOrDefault(x => !x.IsDeleted && x.AssetCode.Equals(obj.AssetCode));
                if(check != null)
                {
                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;
                    check.PackCode = obj.PackCode;
                    check.ZoneCode = obj.ZoneCode;
                    _context.AssetZoneMappings.Update(check);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
                }
                else
                {
                    var zoneMapp = new AssetZoneMapping
                    {
                        ZoneCode = obj.ZoneCode,
                        AssetCode = obj.AssetCode,
                        PackCode = obj.PackCode,
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.AssetZoneMappings.Add(zoneMapp);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["COM_ADD_SUCCESS"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = false;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetPositionAsset(string assetCode)
        {
            var data = _context.AssetZoneMappings.FirstOrDefault(x => !x.IsDeleted && x.AssetCode.Equals(assetCode));
            return Json(data);
        }
        #endregion

        #region Model
        public class AssetMainRes
        {
            public int AssetID { get; set; }
            public string AssetCode { get; set; }
            public string AssetCodeTemp { get; set; }
            public string AssetName { get; set; }
            public string AssetType { get; set; }
            public string AssetGroup { get; set; }
            public string Description { get; set; }
            public string PathIMG { get; set; }
            public string Status { get; set; }
            public string BuyedTime { get; set; }
            public string ExpiredDate { get; set; }
            public string sBuyedTime { get; set; }
            public string sExpiredDate { get; set; }
            public decimal? Cost { get; set; }
            public string Currency { get; set; }
            public string SupplierCode { get; set; }
            public string LocationText { get; set; }
            public string LocationGps { get; set; }
            public string LocationSet { get; set; }
            public string Branch { get; set; }
            public string Department { get; set; }
            public string UserResponsible { get; set; }
            public int? Quantity { get; set; }
        }
        public class JTableModelAsset : JTableModel
        {
            public int AssetID { get; set; }
            public string AssetCode { get; set; }
            public string AssetName { get; set; }
            public string AssetType { get; set; }
            public string AssetGroup { get; set; }
            public string Status { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ManagerId { get; set; }
            public string WHS_Code { get; set; }
            public string FloorCode { get; set; }
            public string LineCode { get; set; }
            public string RackCode { get; set; }
            public string RackPosition { get; set; }

        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_stringLocalizerFp.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerMpam.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerCus.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerSup.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_contractController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerAttr.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringMaterialProdLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_stringLocalizerFile.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_commonSettingController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_edmsRepositoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .DistinctBy(x => x.Name);
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}