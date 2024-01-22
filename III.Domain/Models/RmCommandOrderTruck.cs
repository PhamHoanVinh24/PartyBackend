using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_COMMAND_ORDER_TRUCK")]
    public class RmCommandOrderTruck
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 100)]
        public string NgayDieuXe { get; set; }
        [StringLength(maximumLength: 255)]
        public string MaTheoDoi { get; set; }

        [StringLength(maximumLength: 255)]
        public string Payment { get; set; }
        [StringLength(maximumLength: 255)]
        public string SoLenh { get; set; }
        [StringLength(maximumLength: 255)]
        public string TenTaiXe { get; set; }
        [StringLength(maximumLength: 255)]
        public string SoXe { get; set; }
        [StringLength(maximumLength: 255)]
        public string SoMooc { get; set; }
        [StringLength(maximumLength: 255)]
        public string Hang { get; set; }
        [StringLength(maximumLength: 255)]
        public string NoiLay { get; set; }
        [StringLength(maximumLength: 255)]
        public string NoiHa { get; set; }
        [StringLength(maximumLength: 255)]
        public string KhachHang { get; set; }
        [StringLength(maximumLength: 255)]
        public string DiaChi { get; set; }
        [StringLength(maximumLength: 255)]
        public string PhuongAn { get; set; }
        [StringLength(maximumLength: 255)]
        public string GhiChu { get; set; }
        [StringLength(maximumLength: 255)]
        public string KyXacNhan { get; set; }
        [StringLength(maximumLength: 255)]
        public string SoCont { get; set; }
        [StringLength(maximumLength: 100)]
        public string NgayGioDen { get; set; }
        [StringLength(maximumLength: 100)]
        public string NgayGioDi { get; set; }
        [StringLength(maximumLength: 255)]
        public string NeoMooc { get; set; }
        [StringLength(maximumLength: 255)]
        public string CauDuong { get; set; }
        [StringLength(maximumLength: 255)]
        public string VeCong { get; set; }
        [StringLength(maximumLength: 255)]
        public string PhiNgoai { get; set; }
        [StringLength(maximumLength: 255)]
        public string NangCont { get; set; }
        [StringLength(maximumLength: 255)]
        public string HaCont { get; set; }
        [StringLength(maximumLength: 255)]
        public string KiemHoa { get; set; }
        [StringLength(maximumLength: 255)]
        public string VeSinh { get; set; }
        [StringLength(maximumLength: 255)]
        public string LuuBai { get; set; }
        [StringLength(maximumLength: 255)]
        public string PTGiaoCont { get; set; }
        [StringLength(maximumLength: 255)]
        public string LuuRong { get; set; }
        [StringLength(maximumLength: 255)]
        public string TongCong { get; set; }
        [StringLength(maximumLength: 255)]
        public string Title { get; set; }
        [StringLength(maximumLength: 500)]
        public string NoiXuatPhat { get; set; }
        public int? Isdeleted { get; set; }
        [StringLength(maximumLength: 255)]
        public string ChiKhac { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(maximumLength: 255)]
        public string Updatedby { get; set; }
        [StringLength(maximumLength: 255)]
        public string CreatedBy { get; set; }
        [StringLength(maximumLength: 255)]
        public string Active { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(maximumLength: 255)]
        public string CompanyCode { get; set; }
        public DateTime? ConfirmTime { get; set; }
        public string ConfirmType { get; set; }  //D hoặc A
        public int? MucDoUuTien { get; set; }

    }
}