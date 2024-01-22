using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CUSTOMER_EXTEND")]
    public class CustomerExtend
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(100)]
        public string ext_code { get; set; }

        public int? customer_id { get; set; }

        public DateTime? created_time { get; set; }

        public DateTime? updated_time { get; set; }

        public bool? flag { get; set; }

        [StringLength(500)]
        public string ext_value { get; set; }

        [StringLength(255)]
        public string ext_group { get; set; }

        public bool isdeleted { get; set; }

    }
}
