using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("TOKEN_MANAGER")]
    public class TokenManager
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string ServiceType { get; set; }

        [StringLength(255)]
        public string AccountCode { get; set; }

        [StringLength(255)]
        public string AccountName { get; set; }

        [StringLength(255)]
        public string Email { get; set; }

        [StringLength(50)]
        public string Type { get; set; }

        public string AccountNumber { get; set; }

        [StringLength(255)]
        public string Key { get; set; }

        [StringLength(255)]
        public string ApiSecret { get; set; }
        
        public string Token { get; set; }

        [StringLength(255)]
        public string SdkKey { get; set; }

        [StringLength(255)]
        public string SdkSecret { get; set; }

        public string CredentialsJson { get; set; }

        public string RefreshToken { get; set; }

        [StringLength(50)]
        public string AccountRole { get; set; }

        public int? Limit { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string HostClaimCode { get; set; }
    }
}
