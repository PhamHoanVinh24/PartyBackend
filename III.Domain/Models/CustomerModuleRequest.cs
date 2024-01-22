using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace III.Domain.Models
{
    [Table("CUSTOMER_MODULE_REQUEST")]
    public class CustomerModuleRequest
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(50)]
        public string ReqCode { get; set; }
        [StringLength(50)]
        public string ModuleCode { get; set; }
        [StringLength(50)]
        public string Status { get; set; }
    }
}
