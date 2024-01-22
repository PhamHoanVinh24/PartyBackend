//using system;
//using system.linq;
//using microsoft.aspnetcore.mvc;
//using eseim.models;
//using eseim.utils;
//using microsoft.entityframeworkcore;
//using ftu.utils.helpernet;
//using microsoft.extensions.logging;
//using microsoft.aspnetcore.http;
//using microsoft.aspnetcore.hosting;
//using microsoft.extensions.options;
//using iii.admin.controllers;
//using system.io;
//using system.collections.generic;
//using system.globalization;

//namespace eseim.controllers
//{
//    [area("admin")]
//    public class categorycontroller : basecontroller
//    {

//        private readonly ihostingenvironment _hostingenvironment;
//        private readonly eimdbcontext _context;
//        private readonly ilogger _logger;
//        private readonly iactionlogservice _actionlog;
//        private readonly appsettings _appsettings;
//        private readonly iuploadservice _upload;


//        public class jtablemodelcustom : jtablemodel
//        {
//            public string productcode { get; set; }
//            public string productname { get; set; }
//            public string unit { get; set; }
//            public string describe { get; set; }
//            public string filepath { get; set; }
//        }
//        public categorycontroller(eimdbcontext context, iuploadservice upload, ilogger<categorycontroller> logger, ioptions<appsettings> appsettings, ihostingenvironment hostingenvironment, iactionlogservice actionlog)
//        {

//            _context = context;
//            _logger = logger;
//            _hostingenvironment = hostingenvironment;
//            _actionlog = actionlog;
//            _appsettings = appsettings.value;
//            _upload = upload;
//        }

//        public iactionresult index()
//        {
//            return view("index");
//        }

//        [httppost]
//        public object jtable([frombody]jtablemodelcustom jtablepara)
//        {
//            int intbeginfor = (jtablepara.currentpage - 1) * jtablepara.length;
//            var listcommon = _context.commonsettings.select(x => new { x.codeset, x.valueset });
//            var query = from a in _context.productcats

//                        join b in listcommon on a.unit equals b.codeset into b1
//                        from b in b1.defaultifempty()
//                        join c in listcommon on a.productgroup equals c.codeset into c1
//                        from c in c1.defaultifempty()
//                            //join b in _context.cms_extra_fields_groups on a.group equals b.id
//                            //orderby b.name
//                        where (jtablepara.productcode == null || jtablepara.productcode == "" || a.productcode.tolower().contains(jtablepara.productcode.tolower()))
//                        && (jtablepara.productname == null || jtablepara.productname == "" || a.productname.tostring().tolower().contains(jtablepara.productname.tolower()))
//                        && (string.isnullorempty(jtablepara.unit) || a.unit == jtablepara.unit)
//                        && (jtablepara.describe == null || jtablepara.describe == "" || a.note.tolower().contains(jtablepara.describe.tolower()))
//                        orderby a.productid
//                        select new
//                        {
//                            //idd=test(),
//                            id = a.productid,
//                            productcode = a.productcode,
//                            productname = a.productname,
//                            unit = b != null ? b.valueset : "không xác định",
//                            productgroup = c != null ? c.valueset : "không xác định",
//                            pathimg = a.pathimg,
//                            material = a.material,
//                            pattern=a.pattern,
//                            size = a.size,
//                            note = a.note,

//                        };
//            var count = query.count();
//            var data = query.orderusingsortexpression(jtablepara.queryorderby).asnotracking().tolist();
//            var data1 = data.skip(intbeginfor).take(jtablepara.length).tolist();
//            var jdata = jtablehelper.jobjecttable(data1, jtablepara.draw, count, "id", "productcode", "productname", "unit", "pathimg", "material", "pattern", "size", "note", "productgroup");

//            return json(jdata);
//        }

//        //--------------------------------thêm mới---------------------------   
//        [httppost]
//        public object insert([frombody]productcat obj)
//        {
//            var msg = new jmessage();
//            try
//            {
//                if (_context.productcats.firstordefault(x=>x.productcode.tolower().equals(obj.productcode.tolower()))==null)
//                {
//                    productcat obj1 = new productcat();
//                    obj1.productcode = obj.productcode;
//                    obj1.productname = obj.productname;
//                    obj1.productgroup = obj.productgroup;
//                    obj1.unit = obj.unit;
//                    obj1.note = obj.note;
//                    obj1.pathimg = obj.pathimg;
//                    //obj1.productgroup = null;s
//                    obj1.createdby = eseim.appcontext.username;
//                    obj1.updatedby = null;
//                    obj1.createdtime = datetime.now.date;
//                    obj1.updatedtime = null;
//                    obj1.deletedby = null;
//                    obj1.deletedtime = null;
//                    obj1.isdeleted = false;

//                    obj1.qrcode = obj.qrcode;
//                    obj1.barcode = obj.barcode;
//                    obj1.material = obj.material;
//                    obj1.pattern = obj.pattern;
//                    obj1.size = obj.size;
//                    obj1.inheritance = obj.inheritance;
//                    obj1.productcategorytype = obj.productcategorytype;
//                    obj1.producttype = obj.producttype;


//                    _context.productcats.add(obj1);
//                    _context.savechanges();
//                    msg.error = false;
//                    msg.object = obj1;
//                    msg.title = string.format(commonutil.resourcevalue("com_msg_add_success"), commonutil.resourcevalue("category_msg_product"));
//                    //return msg;
//                }
//                else
//                {
//                    msg.error = true;
//                    msg.title = "sản phẩm đã tồn tại, không thể thêm";
//                    //return msg;
//                }
               
//            }
//            catch
//            {
//                msg.error = true;
//                //msg.object = ex;
//                msg.title = string.format(commonutil.resourcevalue("com_err_add"));
//            }
//            return msg;

//        }

//        [httppost]
//        public object update([frombody]productcat obj)
//        {
//            var msg = new jmessage();
//            try
//            {
//                var product = _context.productcats.firstordefault(x=>x.productid==obj.productid&&x.isdeleted==false);
//                if(product!=null)
//                {
//                    product.productname = obj.productname;
//                    product.productgroup = obj.productgroup;
//                    product.unit = obj.unit;
//                    product.note = obj.note;
//                    product.pathimg = obj.pathimg;
//                    product.updatedby = eseim.appcontext.username;
//                    product.updatedtime = datetime.now;
//                    product.qrcode = obj.qrcode;
//                    product.barcode = obj.barcode;
//                    product.material = obj.material;
//                    product.pattern = obj.pattern;
//                    product.size = obj.size;
//                    product.inheritance = obj.inheritance;
//                    product.productcategorytype = obj.productcategorytype;
//                    product.producttype = obj.producttype;
//                    _context.productcats.update(product);
//                    _context.savechanges();
//                    msg.error = false;
//                    msg.title = "cập nhật thành công";
//                }
//                else
//                {
//                    msg.error = true;
//                    msg.title = "sản phẩm không tồn tại hoặc đã bị xóa, vui lòng kiểm tra lại";
//                }
                

//                return msg;
//            }
//            catch(exception ex)
//            {
//                msg.error = true;
//                msg.title = string.format(commonutil.resourcevalue("com_msg_update_failed"), commonutil.resourcevalue("category_msg_product"));
//                return msg;
//            }

//        }


//        //----------------------------------------------xóa-------------------------------
//        [httppost]
//        public object delete(int id)
//        {
//            var msg = new jmessage { error = true };
//            try
//            {
//                var data = _context.productcats.firstordefault(x => x.productid == id);
//                _context.productcats.remove(data);
//                _context.savechanges();
//                msg.error = false;
//                msg.title = string.format(commonutil.resourcevalue("com_msg_delete_success"), commonutil.resourcevalue("category_msg_product"));
//                return json(msg);
//            }
//            catch (exception ex)
//            {
//                msg.error = true;
//                msg.title = string.format(commonutil.resourcevalue("com_msg_delete_fail"), commonutil.resourcevalue("category_msg_product"));
//                return json(msg);
//            }
//        }


//        public object getitemdetail(int id)
//        {
//            var listcommon = _context.commonsettings.select(x => new { x.codeset, x.valueset });
//            //productcat query=new productcat();
//            var query = from ad in _context.productcats

//                        join b in listcommon on ad.unit equals b.codeset into b1
//                        from b in b1.defaultifempty()
//                        join c in listcommon on ad.productgroup equals c.codeset into c1
//                        from c in c1.defaultifempty()
//                        where ad.productid == id
//                        select new
//                        {
//                            productcode = ad.productcode,
//                            productname = ad.productname,
//                            pathimg = ad.pathimg,
//                            note = ad.note,
//                            unit = b != null ? b.valueset : "không xác định",
//                            productgroup = c != null ? c.valueset : "không xác định",
//                        };
//            productcat query1 = new productcat();

//            //var a = _context.productcats.asnotracking().single(m => m.productid == id);
//            return json(query);
//        }
//        [httppost]
//        public object getitem(int id)
//        {

//            var a = _context.productcats.asnotracking().single(m => m.productid == id);
//            return json(a);
//        }

//        [httppost]
//        public object getproductunit()
//        {

//            var data = _context.commonsettings.where(x => x.group == "unit").select(x => new { code = x.codeset, name = x.valueset });
//            return data;


//        }

//        [httppost]

//        public object getproductgroup()
//        {

//            var data = _context.commonsettings.where(x => x.group == "product_group").select(x => new { code = x.codeset, name = x.valueset });
//            return data;


//        }

//        [httppost]

//        public object getinheritances(string productcode)
//        {
//            var data = (from a in _context.productcats
//                        where a.isdeleted == false
//                        && a.productcode!= productcode
//                        select new
//                        {
//                            code = a.productcode,
//                            name = a.productname
//                        }).tolist();
//            return data;
//        }

//        [httppost]
//        public object getproductcategorytypes()
//        {
//            var data = _context.commonsettings.where(x => x.group == "product_category_type").select(x => new { code = x.codeset, name = x.valueset });
//            return data;
//        }
//        [httppost]
//        public object getproducttypes()
//        {
//            var data = _context.commonsettings.where(x => x.group == "product_type").select(x => new { code = x.codeset, name = x.valueset });
//            return data;
//        }

//        [httppost]
//        public jsonresult insertproductattribute([frombody]productattribute obj)
//        {
//            jmessage msg = new jmessage();
//            try
//            {
//                var data = _context.productattributes.firstordefault(x => x.productcode.tolower().equals(obj.productcode.tolower()) && x.attributecode.tolower().equals(obj.attributecode.tolower()) && x.isdeleted == false);
//                if (data != null)
//                {
//                    msg.error = true;
//                    msg.title = "đã tồn tại thuộc tính mở rộng của sản phẩm này, không thể thêm tiếp";
//                }
//                else
//                {
//                    obj.createdtime = datetime.now;
//                    obj.createdby = appcontext.username;
//                    obj.isdeleted = false;
//                    _context.productattributes.add(obj);
//                    _context.savechanges();
//                    msg.error = false;
//                    msg.title = "thêm thành công";
//                }

//            }
//            catch (exception ex) {
//                msg.error = true;
//                msg.title = "có lỗi khi thêm";
//            }
//            return json(msg);
//        }
//        [httppost]
//        public object jtableextend([frombody]jtableextendmodel jtablepara)
//        {
//            int intbeginfor = (jtablepara.currentpage - 1) * jtablepara.length;
//            var query = from a in _context.productattributes
//                        where a.productcode == jtablepara.productcode
//                        && a.isdeleted == false
//                        select new
//                        {
//                            a.id,
//                            a.attributecode,
//                            a.attributename,
//                            a.value,
//                            a.note,
//                            a.createdtime,
//                            a.unit
//                        };
//            var count = query.count();
//            var data = query.orderusingsortexpression(jtablepara.queryorderby).asnotracking().tolist();
//            var data1 = data.skip(intbeginfor).take(jtablepara.length).tolist();
//            var jdata = jtablehelper.jobjecttable(data1, jtablepara.draw, count, "id", "attributecode", "attributename", "value", "note", "createdtime", "unit");

//            return json(jdata);
//        }

//        [httppost]
//        public object deleteattribute(int id)
//        {
//            jmessage msg = new jmessage();
//            var data = _context.productattributes.firstordefault(x=>x.id==id&&x.isdeleted==false);
//            if(data!=null)
//            {
//                data.isdeleted = true;
//                _context.productattributes.update(data);
//                _context.savechanges();
//                msg.error = false;
//                msg.title = "xóa thành công";
//            }
//            else
//            {
//                msg.error = true;
//                msg.title = "thuộc tính không tồn tại hoặc đã bị xóa";
//            }
//            return json(msg);
//        }

//        [httppost]
//        public object updateattribute([frombody]productattribute obj)
//        {
//            jmessage msg = new jmessage();
//            var data = _context.productattributes.firstordefault(x => x.id == obj.id && x.isdeleted == false);
//            if (data != null)
//            {
//                data.attributecode = obj.attributecode;
//                data.attributename = obj.attributename;
//                data.value = obj.value;
//                data.note = obj.note;
//                data.updatedtime = datetime.now;
//                data.updatedby = appcontext.username;
//                _context.productattributes.update(data);
//                _context.savechanges();
//                msg.error = false;
//                msg.title = "cập nhật thành công";
//            }
//            else
//            {
//                msg.error = true;
//                msg.title = "thuộc tính không tồn tại hoặc đã bị xóa";
//            }
//            return json(msg);
//        }
//        [httppost]
//        public object getattributeitem(int id)
//        {
//            jmessage msg = new jmessage();
//            var data = _context.productattributes.firstordefault(x => x.id == id && x.isdeleted == false);
//            if (data != null)
//            {
//                msg.object = data;
//            }
//            else
//            {
//                msg.error = true;
//                msg.title = "thuộc tính không tồn tại hoặc đã bị xóa";
//            }
//            return json(msg);
//        }

//        [httppost]
//        public object uploadimage(iformfile fileupload)
//        {
//            var msg = new jmessage { error = false, title = "" };
//            try
//            {
//                var upload = _upload.uploadimage(fileupload);
//                msg.object = upload.object;
//            }
//            catch (exception ex)
//            {
//                msg.error = true;
//                msg.title = string.format(commonutil.resourcevalue("category_msg_upload_file"));
//            }
//            return json(msg);
//        }


//        [httppost]
//        public jsonresult insertfile(productlotfile obj, iformfile fileupload)
//        {
//            var msg = new jmessage { error = false, title = "" };
//            try
//            {
//                var getrepository = _context.edmsrepositorys.firstordefault(x => x.reposcode == obj.repocode);
//                if (getrepository != null)
//                {
//                    //add custemp file
//                    var productlotfile = new productlotfile
//                    {
//                        productcode = obj.productcode,
//                        filecode = string.concat("product", guid.newguid().tostring()),
//                        type = "product"
//                    };
//                    _context.productlotfiles.add(productlotfile);
//                    _context.savechanges();
//                    var upload = _upload.uploadfile(fileupload, path.combine(_hostingenvironment.webrootpath, getrepository.pathphysic));
//                    //add file
//                    var file = new edmsfile
//                    {
//                        filecode = productlotfile.filecode,
//                        filename = obj.filename,
//                        desc = obj.desc,
//                        reposcode = obj.repocode,
//                        filesize = fileupload.length,
//                        filetypephysic = path.getextension(fileupload.filename),
//                        createdby = eseim.appcontext.username,
//                        createdtime = datetime.now,
//                        url = path.combine(getrepository.pathphysic, upload.object.tostring()),
//                    };
//                    _context.edmsfiles.add(file);
//                    _context.savechanges();
//                    msg.title = "thêm tệp tin thành công!";
//                }
//                else
//                {
//                    msg.error = true;
//                    msg.title = "kho dữ liệu không tồn tại!";
//                }
//            }
//            catch (exception ex)
//            {
//                msg.error = true;
//                msg.title = "có lỗi xảy ra!";
//                msg.object = ex;
//            }
//            return json(msg);
//        }
//        [httppost]
//        public object jtablefile([frombody]jtableproductfile jtablepara)
//        {
//            int intbeginfor = (jtablepara.currentpage - 1) * jtablepara.length;
//            if (jtablepara.productcode == null)
//            {
//                return jtablehelper.jobjecttable(new list<object>(), jtablepara.draw, 0, "contractnoteid", "title", "contractcode", "note", "tags", "createdby", "createdtime");
//            }
//            var fromdate = !string.isnullorempty(jtablepara.fromdate) ? datetime.parseexact(jtablepara.fromdate, "dd/mm/yyyy", cultureinfo.invariantculture) : (datetime?)null;
//            var todate = !string.isnullorempty(jtablepara.todate) ? datetime.parseexact(jtablepara.todate, "dd/mm/yyyy", cultureinfo.invariantculture) : (datetime?)null;
//            var query = from a in _context.productlotfiles
//                        join b in _context.edmsfiles on a.filecode equals b.filecode
//                        where a.productcode == jtablepara.productcode && b.isdeleted == false
//                        && ((fromdate == null) || (b.createdtime.hasvalue && b.createdtime.value.date >= fromdate))
//                        && ((todate == null) || (b.createdtime.hasvalue && b.createdtime.value.date <= todate))
//                        && a.type=="product"
//                        select new
//                        {
//                            a.id,
//                            b.filename,
//                            b.filetypephysic,
//                            b.desc,
//                            b.url,
//                            b.createdtime,
//                            b.updatedtime,
//                        };
//            var count = query.count();
//            var data = query.orderusingsortexpression(jtablepara.queryorderby).skip(intbeginfor).take(jtablepara.length).asnotracking().tolist();
//            var jdata = jtablehelper.jobjecttable(data, jtablepara.draw, count, "id", "filename", "filetypephysic", "desc", "url", "createdtime", "updatedtime");
//            return json(jdata);
//        }
//        [httppost]
//        public jsonresult deletefile(int id)
//        {
//            var msg = new jmessage { error = false, title = "" };
//            try
//            {
//                var data = _context.productlotfiles.firstordefault(x => x.id == id);
//                _context.productlotfiles.remove(data);

//                var file = _context.edmsfiles.firstordefault(x => x.filecode == data.filecode);
//                _context.edmsfiles.remove(file);

//                _context.savechanges();
//                msg.title = "xóa tệp tin thành công";
//            }
//            catch (exception ex)
//            {
//                msg.error = true;
//                msg.object = ex.message;
//                msg.title = "có lỗi khi xóa tệp tin!";
//            }
//            return json(msg);
//        }
//        [httpget]
//        public jsonresult getfile(int id)
//        {
//            var msg = new jmessage { error = false, title = "" };
//            try
//            {
//                var data = _context.productlotfiles.single(m => m.id == id);
//                if (data != null)
//                {
//                    var file = _context.edmsfiles.firstordefault(x => x.filecode == data.filecode);
//                    var model = new productlotfile
//                    {
//                        repocode = file.reposcode,
//                        filename = file.filename,
//                        desc = file.desc,
//                        id = data.id,
//                    };
//                    msg.object = model;
//                }
//                else
//                {
//                    msg.error = true;
//                    msg.title = "tệp tin không tồn tại!";
//                }
//            }
//            catch (exception ex)
//            {
//                msg.error = true;
//                msg.object = ex.message;
//                msg.title = "có lỗi khi lấy tệp tin!";
//            }
//            return json(msg);
//        }


//        [httppost]
//        public jsonresult updatefile(supplierfile obj, iformfile fileupload)
//        {
//            var msg = new jmessage { error = false, title = "" };
//            try
//            {
//                var getrepository = _context.edmsrepositorys.firstordefault(x => x.reposcode == obj.repocode);
//                if (getrepository != null)
//                {
//                    var data = _context.productlotfiles.firstordefault(x => x.id == obj.id);
//                    var file = _context.edmsfiles.firstordefault(x => x.filecode == data.filecode);
//                    file.filename = obj.filename;
//                    file.desc = obj.desc;
//                    file.reposcode = obj.repocode;
//                    if (fileupload != null && fileupload.length != 0)
//                    {
//                        var upload = _upload.uploadfile(fileupload, path.combine(_hostingenvironment.webrootpath, getrepository.pathphysic));
//                        file.filesize = fileupload.length;
//                        file.filetypephysic = path.getextension(fileupload.filename);
//                        file.url = path.combine(getrepository.pathphysic, upload.object.tostring());
//                    }
//                    file.updatedby = eseim.appcontext.username;
//                    file.updatedtime = datetime.now;

//                    _context.edmsfiles.update(file);
//                    _context.savechanges();
//                    msg.title = "chỉnh sửa tệp tin thành công!";
//                }
//                else
//                {
//                    msg.error = true;
//                    msg.title = "kho dữ liệu không tồn tại!";
//                }
//            }
//            catch (exception ex)
//            {
//                msg.error = true;
//                msg.object = ex.message;
//                msg.title = "có lỗi xảy ra!";
//            }
//            return json(msg);
//        }

//        public class jtableextendmodel : jtablemodel
//        {
//            public string productcode { get; set; }
//        }

//        public class jtableproductfile : jtablemodel
//        {
//            public string productcode { get; set; }
//            public string fromdate { get; set; }
//            public string todate { get; set; }
//        }

        
//    }
//}