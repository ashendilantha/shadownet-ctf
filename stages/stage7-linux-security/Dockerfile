FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    openssh-server \
    gcc \
    sudo \
    curl \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /var/run/sshd

# Setup user player
RUN useradd -m -s /bin/bash player && \
    echo "player:password123" | chpasswd

# Setup root password
RUN echo "root:NexaRootAdmin2026!" | chpasswd

# Setup flag
RUN echo "SHADOWNET{linux_a8eafa5848a204be0958d232f9e83ed9}" > /root/flag.txt && \
    chmod 600 /root/flag.txt && \
    chown root:root /root/flag.txt

# Create vulnerable SUID binary (relative execution of df)
RUN echo '#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\nint main(){setuid(0);setgid(0);printf("=== NexaCorp Maintenance Utility ===\\n");system("df -h");return 0;}' > /tmp/maintenance.c && \
    gcc -o /usr/local/bin/nexa-backup /tmp/maintenance.c && \
    chmod 4755 /usr/local/bin/nexa-backup && \
    chown root:root /usr/local/bin/nexa-backup && \
    rm /tmp/maintenance.c

# Configure SSH
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/KbdInteractiveAuthentication no/KbdInteractiveAuthentication yes/' /etc/ssh/sshd_config

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]

