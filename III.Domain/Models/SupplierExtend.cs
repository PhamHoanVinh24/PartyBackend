using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SUPPLIER_EXTEND")]
    public class SupplierExtend
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(100)]
        public string ext_code { get; set; }
        public int? supplier_code { get; set; }
        public DateTime? created_time { get; set; }
        public DateTime? updated_time { get; set; }
        public bool? flag { get; set; }
        [StringLength(maximumLength: 500)]
        public string ext_value { get; set; }
        [StringLength(maximumLength: 255)]
        public string ext_group { get; set; }
        public bool isdeleted { get; set; }

    }
}
