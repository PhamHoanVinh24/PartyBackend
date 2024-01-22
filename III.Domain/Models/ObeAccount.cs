using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{ 
    [Table("OBE_ACCOUNT")]
    public class ObeAccount
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string UserName { get; set; }

        [StringLength(255)]
        public string Password { get; set; }
    }
}
