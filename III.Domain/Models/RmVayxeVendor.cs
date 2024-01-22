
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("RM_VAYXE_VENDOR")]
    public class RmVayxeVendor
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorCode { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorContact { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorName { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorLogo { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorPhone { get; set; }
        public string VendorAddress { get; set; }

        public int? VendorType { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorWebsite { get; set; }

        [StringLength(maximumLength: 250)]
        public string VendorFB { get; set; }

        [StringLength(maximumLength: 2000)]
        public string VendorDesc { get; set; }
        public string GeoCode { get; set; }

        public int? Flag { get; set; }
        public bool? IsDelete { get; set; }

        public int? CreateBy { get; set; }
        public int? UpdateBy { get; set; }

        public DateTime? CreateTime { get; set; }

        public DateTime? UpdateTime { get; set; }

    }
}
